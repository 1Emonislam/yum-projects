const moment = require('moment-timezone')
const resolveTodayClientGroups = require('./resolveTodayClientGroups')
const resolveInstallmentsForMeetingsByClientGroupIds = require('./resolveInstallmentsForMeetingsByClientGroupIds')

const getStats = (installments, clientGroupsMeetings) => {
  const { overdue, installment } = installments.reduce(
    (acc, installment) => {
      return {
        overdue: acc.overdue + (installment.overdue || 0),
        installment: acc.installment + (installment.installment || 0),
      }
    },
    {
      todaysRealization: 0,
      overdue: 0,
      installment: 0,
    }
  )

  const { todaysRealization } = clientGroupsMeetings.reduce(
    (acc, clientGroupsMeeting) => {
      return {
        todaysRealization:
          acc.todaysRealization +
          clientGroupsMeeting.installments.reduce(
            (acc, installment) => acc + (installment.todaysRealization || 0),
            0
          ),
      }
    },
    {
      todaysRealization: 0,
    }
  )

  return {
    todaysRealization,
    overdue,
    installment,
  }
}

const resolveTodayRealizations = async (_, __, { dataSources, user }) => {
  const clientGroups = await resolveTodayClientGroups(null, null, {
    dataSources,
    user,
  })

  const clientGroupsIds = clientGroups.map(clientGroup => clientGroup._id)

  const installments = await resolveInstallmentsForMeetingsByClientGroupIds(
    clientGroupsIds,
    dataSources
  )

  const clientGroupsMeetings = await dataSources.clientGroupsMeetings.collection
    .find({
      clientGroupId: { $in: clientGroupsIds },
      createdAt: {
        $gte: moment().tz(process.env.TIMEZONE).startOf('day').toDate(),
        $lte: moment().tz(process.env.TIMEZONE).endOf('day').toDate(),
      },
    })
    .toArray()

  return {
    total: getStats(installments, clientGroupsMeetings),
  }
}

module.exports = resolveTodayRealizations
