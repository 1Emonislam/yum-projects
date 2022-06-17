const { ObjectId } = require('mongodb')

const moment = require('moment-timezone')

const timezone = 'Africa/Kampala'

function getRange(startDate, endDate) {
  const moment = require('moment-timezone')
  let fromDate = moment(startDate).tz(timezone)
  let toDate = moment(endDate).tz(timezone)
  let diff = toDate.diff(fromDate, 'days')
  let range = []
  for (let i = 0; i <= diff; i++) {
    range.push(moment(startDate).add(i, 'days'))
  }

  return range
}

const DATE_FORMAT = 'DD.MM.YYYY'

function doesFallOnHoliday(holidays, date, futureOnly = true) {
  const moment = require('moment-timezone')

  if (futureOnly && !moment(date).tz(timezone).isAfter(moment(), 'day')) {
    return
  }

  for (let i = 0; i < holidays.length; i++) {
    const holiday = holidays[i]

    let startAt = moment(holiday.startAt).tz(timezone)
    let endAt = moment(holiday.endAt).tz(timezone)

    if (holiday.yearly) {
      const shouldAddYearToEndAt = Number(endAt.year()) > Number(startAt.year())

      const currentYear = moment(date).tz(timezone).year()

      startAt.year(currentYear)

      endAt.year(shouldAddYearToEndAt ? currentYear + 1 : currentYear)
    }

    if (moment(date).tz(timezone).isBetween(startAt, endAt, 'day', '[]')) {
      return true
    }
  }

  return false
}

const canCloseCashAtHandReport = async (
  _,
  { input: { branchId, date } },
  { dataSources }
) => {
  const branch = await dataSources.branches.collection.findOne({
    _id: ObjectId(branchId),
  })

  const today = moment().tz(timezone)

  if (!branch) {
    return {
      canClose: false,
      lastOpenDate: today.format(DATE_FORMAT),
    }
  }

  const targetDate = moment(date, DATE_FORMAT).tz(timezone)

  const initDate = branch.initDate ? moment(branch.initDate).tz(timezone) : null

  const cashAtHandForm = await dataSources.cashAtHandForms.collection
    .find({
      branchId: ObjectId(branchId),
      dateIso: {
        $lte: today.tz(timezone).endOf('day').toDate(),
      },
      closed: true,
    })
    .sort({ dateIso: -1 })
    .limit(1)
    .toArray()

  const firstFoundDate = cashAtHandForm?.[0]?.dateIso

  const hasDate = firstFoundDate ? true : false

  if (!hasDate) {
    return {
      canClose: moment(initDate).isSame(targetDate, 'day'),
      lastOpenDate: moment(initDate).tz(timezone).format(DATE_FORMAT),
    }
  }

  const lastDate = moment(firstFoundDate).tz(timezone)

  const range = getRange(lastDate, today)

  const holidays = await dataSources.holidays.collection.find().toArray()

  const dates = range.filter(date => {
    const isoWeekday = moment(date).isoWeekday()
    const isWeekend = isoWeekday >= 6
    const isHoliday = doesFallOnHoliday(holidays, date, false)

    return !isWeekend && !isHoliday
  })

  const datesToTargetDate = dates.filter(date => {
    return date.isBefore(targetDate, 'day')
  })

  const isTargetDateHoliday = doesFallOnHoliday(holidays, targetDate, false)
  const targetDayIsoWeekday = targetDate.isoWeekday()
  const isTargetDateWeekend =
    targetDayIsoWeekday === 6 || targetDayIsoWeekday === 7

  const canClose =
    datesToTargetDate.length === 1 &&
    !isTargetDateHoliday &&
    !isTargetDateWeekend

  const lastOpenDate =
    dates.length > 1
      ? dates[1].tz(timezone).format(DATE_FORMAT)
      : today.format(DATE_FORMAT)

  return {
    canClose,
    lastOpenDate,
  }
}

module.exports = canCloseCashAtHandReport
