const _ = require('lodash')
const { ObjectId } = require('mongodb')
const moment = require('moment-timezone')

const updateLoanAfterMeeting = require('./updateLoanAfterMeeting')

const collectInstallment = async (
  __,
  { input },
  { dataSources, user, eventProcessor }
) => {
  const userId = user._id

  const clientGroupsMeeting =
    await dataSources.clientGroupsMeetings.collection.findOne({
      _id: input.clientGroupMeetingId,
    })

  const loan = await dataSources.loans.collection.findOne({
    _id: input.loanId,
  })

  const todayUpdateEvent = await dataSources.events.collection.findOne(
    {
      obj: 'loan',
      objId: input.loanId,

      $or: [
        { transactionName: { $ne: 'COLLECT_INSTALLMENT' } },
        {
          timestamp: {
            $lt: moment.tz(process.env.TIMEZONE).startOf('day').toDate(),
          },
        },
      ],
      'payload.installments': { $exists: true },
    },
    { sort: { timestamp: -1 } }
  )

  const updatedMeetingInstallment = clientGroupsMeeting.installments.map(
    installment => {
      if (String(installment._id) == String(input._id)) {
        return {
          ...installment,
          todaysRealization: input.todaysRealization,
        }
      } else {
        return installment
      }
    }
  )

  const updatedClientGroupsMeeting = _.omit(
    {
      ...clientGroupsMeeting,
      installments: updatedMeetingInstallment,
    },
    ['clientGroup']
  )

  const updatedLoan = updateLoanAfterMeeting({
    loan: todayUpdateEvent
      ? {
          _id: loan._id,
          approvedAmount: loan.approvedAmount,
          interestRate: loan.interestRate,
          ...todayUpdateEvent.payload,
          status: loan.status,
        }
      : loan,
    installmentUpdate: input,
  })

  const domainEvent = {
    _id: new ObjectId(),
    type: 'collectInstallment',
    userId: ObjectId(userId),
    timestamp: new Date(),
    payload: {
      loanId: loan._id,
      installmentId: ObjectId(input._id),
      todaysRealization: input.todaysRealization,
    },
    transactionName: 'COLLECT_INSTALLMENT',
  }

  const updateClientGroupsMeetingEvent = {
    _id: ObjectId(),
    type: 'update',
    obj: 'clientGroupMeeting',
    objId: ObjectId(String(updatedClientGroupsMeeting._id)),
    userId: ObjectId(String(userId)),
    payload: updatedClientGroupsMeeting,
    timestamp: new Date(),
    parentId: domainEvent._id,
    transactionName: 'COLLECT_INSTALLMENT',
  }

  const updateLoanEvent = {
    _id: ObjectId(),
    type: 'update',
    obj: 'loan',
    objId: ObjectId(String(updatedLoan._id)),
    userId: ObjectId(String(userId)),
    payload: updatedLoan,
    timestamp: new Date(),
    parentId: domainEvent._id,
    transactionName: 'COLLECT_INSTALLMENT',
  }

  const result = await Promise.all(
    [domainEvent, updateClientGroupsMeetingEvent, updateLoanEvent].map(event =>
      eventProcessor.addEvent(event)
    )
  )

  console.log('Collect installment result', result)

  console.log('Done!')

  return true
}

module.exports = collectInstallment
