const _ = require('lodash')
const { ObjectId } = require('mongodb')
const moment = require('moment-timezone')

const resolveInstallmentsForMeetingsByClientGroupIds = require('./resolveInstallmentsForMeetingsByClientGroupIds')

const initAttendance = (clients = []) => {
  const attendance = clients.map(client => {
    return {
      clientId: client._id,
      firstName: client.firstName,
      lastName: client.lastName,
      attended: false,
      representative: false,
    }
  })

  return attendance
}

const createClientGroupMeeting = async (
  clientGroupId,
  { clients, installments, loanOfficer, place },
  dataSources,
  eventProcessor
) => {
  const clientGroupMeeting = {
    _id: ObjectId(),
    attendance: initAttendance(clients),
    clientGroupId,
    endedAt: null,
    installments,
    loanOfficer,
    notes: null,
    photoUrl: '',
    place,
    potentialClientsVerified: false,
    requests: '',
    scheduledAt: new Date(),
    startedAt: null,
  }

  const event = {
    _id: ObjectId(),
    type: 'create',
    obj: 'clientGroupMeeting',
    objId: clientGroupMeeting._id,
    payload: {
      ..._.omit(clientGroupMeeting, ['_id']),
    },
    timestamp: new Date(),
  }

  await eventProcessor.addEvent(event)

  const response = await dataSources.clientGroupsMeetings.findOneById(
    clientGroupMeeting._id
  )

  return response
}

const todayMeeting = async (
  _,
  { input: arg },
  { dataSources, user, eventProcessor }
) => {
  const clientGroupId = ObjectId(arg)

  const clientGroup = await dataSources.clientGroups.collection.findOne({
    _id: clientGroupId,
    'meeting.dayOfWeek': moment().tz(process.env.TIMEZONE).isoWeekday(),
  })

  if (!clientGroup) {
    return
  }

  const todayMeeting =
    await dataSources.clientGroupsMeetings.collection.findOne({
      clientGroupId,
      scheduledAt: {
        $gte: moment.tz(process.env.TIMEZONE).startOf('day').toDate(),
        $lte: moment.tz(process.env.TIMEZONE).endOf('day').toDate(),
      },
    })

  if (todayMeeting) {
    return todayMeeting
  }

  const clients = await dataSources.clients.collection
    .find({ clientGroupId })
    .toArray()

  const { firstName, lastName, role } = user

  const loanOfficer =
    role === 'loanOfficer'
      ? {
          firstName,
          lastName,
        }
      : undefined

  const place =
    clientGroup && clientGroup.meeting && clientGroup.meeting.address

  const installments = await resolveInstallmentsForMeetingsByClientGroupIds(
    [arg],
    dataSources
  )

  return await createClientGroupMeeting(
    clientGroupId,
    {
      clients,
      installments,
      loanOfficer,
      place,
    },
    dataSources,
    eventProcessor
  )
}

module.exports = todayMeeting
