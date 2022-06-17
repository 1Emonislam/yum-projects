import moment from 'moment-timezone'

import { timezone } from '../constants'

export const generateInstallmentsStartDate = ({
  dayOfWeek,
  frequency,
  clientGroupStartedAt,
  start = moment().tz(timezone),
  firstLoanDisbursement = 0,
  gracePeriod = 0,
}) => {
  if (!dayOfWeek) {
    throw new Error('Specify dayOfWeek')
  }

  if (!frequency) {
    throw new Error('Specify frequency')
  }

  if (frequency === 'biweekly' && !clientGroupStartedAt) {
    throw new Error('Specify clientGroupStartedAt')
  }

  const date = moment(start)
    .tz(timezone)
    .add(firstLoanDisbursement, 'days')
    .add(gracePeriod, 'days')

  if (frequency === 'weekly') {
    date.isoWeekday(
      dayOfWeek + (dayOfWeek <= moment(date).isoWeekday() ? 7 : 0)
    )
  } else if (frequency === 'biweekly') {
    date
      .isoWeekday(dayOfWeek + (dayOfWeek <= moment(date).isoWeekday() ? 7 : 0))
      .endOf('day')

    const diff = date.diff(clientGroupStartedAt, 'weeks')

    if (diff % 2 === 1) {
      date.add(1, 'week')
    }
  } else if (frequency === 'monthly') {
    const dateTest = date.clone()

    date.add(1, 'month').startOf('month').isoWeekday(dayOfWeek)

    if (date.month() === dateTest.month()) {
      date.add(1, 'week')
    }
  } else {
    throw new Error('Invalid frequency')
  }

  return date.endOf('day')
}
