const { ObjectId } = require('mongodb')

const moment = require('moment-timezone')

const isHoliday = require('./isHoliday')

const timezone = process.env.TIMEZONE

const isToday = clientGroup => {
  const { dayOfWeek, frequency, startedAt } = clientGroup.meeting

  if (startedAt) {
    if (moment().tz(timezone).isBefore(moment(startedAt).tz(timezone), 'day')) {
      return false
    }
  }

  if (frequency === 'weekly') {
    return true
  } else if (frequency === 'biweekly') {
    const test = moment().tz(timezone).diff(startedAt, 'weeks')

    return test % 2 === 0
  } else if (frequency === 'monthly') {
    const test = moment().tz(timezone).startOf('month').isoWeekday(dayOfWeek)

    if (moment().tz(timezone).month() !== test.month()) {
      test.add(1, 'week')
    }

    if (moment().tz(timezone).isSame(test, 'day')) {
      return true
    }
  } else {
    throw new Error('Unhandled frequency')
  }
}

const todayClientGroups = async (_, __, { dataSources, user }) => {
  if (await isHoliday(dataSources, timezone)) {
    return []
  }

  const clientGroup = await dataSources.clientGroups.collection
    .find({
      loanOfficerId: ObjectId(user._id),
      status: 'active',
      'meeting.dayOfWeek': moment().tz(timezone).isoWeekday(),
    })
    .toArray()

  return clientGroup.filter(isToday)
}

module.exports = todayClientGroups
