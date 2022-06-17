const { ObjectId } = require('mongodb')
const moment = require('moment-timezone')
const { generateDueDates } = require('../../utils')

const holidaysOnUpdate = async (event, dataSources, eventProcessor) => {
  const timezone = process.env.TIMEZONE

  const isTriggeredByEditing = event.type === 'update'

  if (isTriggeredByEditing) {
    const {
      endAt,
      previousEndAt,
      previousStartAt,
      previousYearly,
      startAt,
      yearly,
    } = event.payload

    const timeHasChanged =
      startAt !== previousStartAt ||
      endAt !== previousEndAt ||
      yearly !== previousYearly

    if (!timeHasChanged) {
      return
    }
  }

  const loans = await dataSources.loans.collection
    .find({}, { _id: 1, installments: 1 })
    .toArray()

  const holidaysFromDatabase = await dataSources.holidays.collection
    .find({}, { startAt: 1, endAt: 1, yearly: 1 })
    .toArray()

  const holidays = holidaysFromDatabase.map(holiday => {
    holiday.startAt = moment(holiday.startAt).tz(timezone).toDate()
    holiday.endAt = moment(holiday.endAt).tz(timezone).toDate()

    holiday.shouldAddYearToEndAt =
      holiday.endAt.getFullYear() > holiday.startAt.getFullYear()

    return holiday
  })

  const doesFallOnHoliday = (holidays, date, futureOnly = true) => {
    if (futureOnly && date.getTime() <= Date.now()) {
      return false
    }

    for (let i = 0; i < holidays.length; i++) {
      const holiday = holidays[i]

      if (holiday.yearly) {
        const currentYear = date.getFullYear()

        holiday.startAt.setFullYear(currentYear)
        holiday.endAt.setFullYear(
          holiday.shouldAddYearToEndAt ? currentYear + 1 : currentYear
        )
      }

      if (
        holiday.endAt.getTime() >= date.getTime() &&
        holiday.startAt.getTime() <= date.getTime()
      ) {
        return true
      }
    }

    return false
  }

  const loansWithFutureInstallments = loans.filter(loan => {
    if (loan.installments.length > 0) {
      const last = loan.installments.length - 1

      if (moment(loan.installments[last].due).isAfter(undefined, 'day')) {
        return true
      }
    }

    return false
  })

  let loansToUpdate = []

  loansWithFutureInstallments.forEach(loan => {
    const nextInstallmentIndex = loan.installments.findIndex(installment =>
      moment(installment.due).tz(timezone).isSameOrAfter(undefined, 'day')
    )

    const initialIndex = nextInstallmentIndex > 0 ? nextInstallmentIndex - 1 : 0

    const initialDueDate = moment(loan.installments[initialIndex].due).tz(
      timezone
    )

    if (nextInstallmentIndex > 0) {
      initialDueDate.add(1, 'weeks')
    }

    const newDueDates = generateDueDates({
      initialDueDate: initialDueDate,
      numberOfDueDates: loan.installments.length - nextInstallmentIndex,
      holidays,
      frequencyOfDueDates: loan.duration.unit,
    })

    let shouldUpdate = false

    for (let i = 0; i < newDueDates.length; i++) {
      const j = i + nextInstallmentIndex

      if (
        newDueDates[i].toDate().getTime() !==
        moment(loan.installments[j].due).valueOf()
      ) {
        shouldUpdate = true
        break
      }
    }

    if (shouldUpdate) {
      loansToUpdate.push({
        id: loan._id,
        installmentIndex: nextInstallmentIndex,
        dueDates: newDueDates,
      })
    }
  })

  if (loansToUpdate.length > 0) {
    try {
      const updatedLoans = loansToUpdate.map(base => {
        const { _id, installments } = loans.find(loan => loan._id === base.id)

        for (let i = base.installmentIndex; i < installments.length; i++) {
          const dueDatesIndex = i - base.installmentIndex

          installments[i].due = base.dueDates[dueDatesIndex].toDate()
        }

        return {
          type: 'update',
          obj: 'loan',
          objId: _id,
          payload: { installments: installments },
          timestamp: new Date(),
          _id: ObjectId(),
        }
      })

      await Promise.all(updatedLoans.map(loan => eventProcessor.addEvent(loan)))

      return updatedLoans
    } catch (e) {
      console.log('Error:', e)
    }
  }
}
module.exports = holidaysOnUpdate
