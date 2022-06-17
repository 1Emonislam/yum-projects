import moment from 'moment-timezone'

import { timezone } from '../constants'

const doesFallOnHoliday = (holidays, date, futureOnly = true) => {
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

export const generateDueDates = ({
  initialDueDate,
  numberOfDueDates,
  frequencyOfDueDates,
  holidays,
  futureOnly = true,
}) => {
  if (!frequencyOfDueDates) {
    throw new Error('Specify frequencyOfDueDates')
  }

  const due = moment(initialDueDate).tz(timezone).endOf('day').milliseconds(0)

  const isoWeekday = moment(initialDueDate).tz(timezone).isoWeekday()

  let dueDates = []

  while (dueDates.length < numberOfDueDates) {
    if (!doesFallOnHoliday(holidays, due, futureOnly)) {
      const dueClone = due.clone()

      dueDates.push(dueClone)

      switch (frequencyOfDueDates) {
        case 'month':
          due
            .add(5, 'week')
            .startOf('month')
            .isoWeekday(isoWeekday)
            .endOf('day')
            .milliseconds(0)

          if (due.month() === dueClone.month()) {
            due.add(1, 'week')
          }

          break
        case 'twoWeeks':
          due.add(2, 'week')
          break
        default:
          due.add(1, 'week')
      }
    } else {
      due.add(1, 'week')
    }
  }

  return dueDates
}
