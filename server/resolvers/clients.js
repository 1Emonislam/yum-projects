const _ = require('lodash')
const { ObjectId } = require('mongodb')
const moment = require('moment-timezone')

const { generateDueDates } = require('../utils')
const clientsInspections = require('./legacy/resolveClientsInspections')
const { buildAuthorizedQuery } = require('../utils')
const { defineAbilityFor } = require('../utils/defineAbility')

const timezone = process.env.TIMEZONE

const resolvers = {
  cashierId: async (parent, __, { dataSources }) => {
    return dataSources.clients.collection.findOne({
      _id: parent.cashierId,
    })
  },
  client: async (__, argv, { dataSources }) => {
    const loanOfficerId = argv?.query?.clientGroupId?.loanOfficerId?._id

    const branchId = argv?.query?.clientGroupId?.branchId?._id

    if (loanOfficerId || branchId) {
      const loanOfficer = loanOfficerId
        ? { 'clientGroup.loanOfficerId': ObjectId(loanOfficerId) }
        : {}

      const branchManager = branchId
        ? { 'clientGroup.branchId': ObjectId(branchId) }
        : {}

      // const groups = await dataSources.clientGroups.collection
      //   .find({
      //     _id: ObjectId(argv?.query?._id),
      //     ...loanOfficer,
      //     ...branchManager,
      //   })
      //   .toArray()

      const data = await dataSources.clients.collection
        .aggregate([
          {
            $lookup: {
              from: 'clientGroups',
              localField: 'clientGroupId',
              foreignField: '_id',
              as: 'clientGroup',
            },
          },
          {
            $unwind: {
              path: '$clientGroup',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              _id: ObjectId(argv?.query?._id),
              // TODO: Find better names for the variables below
              ...loanOfficer,
              ...branchManager,
            },
          },
        ])
        .toArray()

      if (data.length > 0) {
        return data[0]
      }

      return []
    }

    return dataSources.clients.collection.findOne({
      _id: ObjectId(argv?.query?._id),
    })
  },
  clientId: async (parent, __, { dataSources }) => {
    return dataSources.clients.collection.findOne({
      _id: parent.clientId,
    })
  },
  clients: async (__, argv, { dataSources, user }, info) => {
    // const q = info.fieldNodes.find(field => field.name.value === info.fieldName)

    // q.selectionSet.selections.map(s => {
    //   // console.log('---', s)
    // })
    const ability = defineAbilityFor(user)
    const authorizedQuery = buildAuthorizedQuery(ability, 'ClientGroup', 'read')

    let query = {}

    let clientGroupQuery = { ...authorizedQuery }

    let limit = 1000

    const clientGroupId = argv?.query?.clientGroupId?._id

    const status = argv?.query?.status

    const statusIn = argv?.query?.status_in

    const statusNin = argv?.query?.status_nin

    const idLt = argv?.query?._id_lt

    const limitNumber = argv?.limit

    const loanOfficerId = argv?.query?.clientGroupId?.loanOfficerId?._id

    const branchId = argv?.query?.clientGroupId?.branchId?._id

    const clientGroupStatusIn = argv?.query?.clientGroupId?.status_in

    const clientGroupStatusNin = argv?.query?.clientGroupId?.status_nin

    if (clientGroupId) {
      query.clientGroupId = ObjectId(clientGroupId)
    }

    if (statusIn) {
      query.status = {
        $in: statusIn,
      }
    }

    if (statusNin) {
      query.status = {
        $nin: statusNin,
      }
    }

    if (status) {
      query.status = status
    }

    if (idLt) {
      query._id = {
        $lt: ObjectId(idLt),
      }
    }

    if (limitNumber) {
      limit = limitNumber
    }

    if (loanOfficerId) {
      clientGroupQuery.loanOfficerId = ObjectId(loanOfficerId)
    }

    if (branchId) {
      clientGroupQuery.branchId = ObjectId(branchId)
    }

    if (clientGroupStatusIn) {
      clientGroupQuery.status = {
        $in: clientGroupStatusIn,
      }
    }

    if (clientGroupStatusNin) {
      clientGroupQuery.status = {
        $nin: clientGroupStatusNin,
      }
    }

    const isClientGroupQueryEmpty = _.isEmpty(clientGroupQuery)

    if (isClientGroupQueryEmpty) {
      return await dataSources.clients.collection
        .find(query)
        .sort({ _id: -1 })
        .limit(limit)
        .toArray()
    }

    const clientGroups = await dataSources.clientGroups.collection
      .find(clientGroupQuery, { projection: { _id: 1 } })
      .toArray()

    if (clientGroups.length === 0) {
      return []
    }

    console.log('--li', limit)

    const clients = await dataSources.clients.collection
      .find({
        clientGroupId: {
          $in: clientGroups.map(clientGroup => clientGroup._id),
        },
        ...query,
      })
      .sort({ _id: -1 })
      .limit(limit)
      .toArray()

    return clients
  },
  clientsCount: async (__, ___, { dataSources }) => {
    return dataSources.clients.collection.find().count()
  },
  clientsInspections,
  moveClientToAnotherClientGroup: async (
    __,
    argv,
    { dataSources, user, eventProcessor }
  ) => {
    const clientId = ObjectId(argv.input.clientId)

    const clientGroupId = ObjectId(argv.input.clientGroupId)

    const userId = ObjectId(user._id)

    const transactionName = 'MOVE_CLIENT_TO_ANOTHER_CLIENT_GROUP'

    const timestamp = new Date()

    const events = []

    const client = await dataSources.clients.collection.findOne({
      _id: clientId,
    })

    const domainEvent = {
      _id: new ObjectId(),
      type: 'moveClientToAnotherClientGroup',
      userId,
      payload: {
        clientId,
        clientGroupId,
      },
      transactionName,
      timestamp,
    }

    events.push(domainEvent)

    const parentId = domainEvent._id

    const updateClientEvent = {
      _id: ObjectId(),
      type: 'update',
      obj: 'client',
      objId: clientId,
      payload: {
        clientGroupId,
      },
      userId,
      parentId,
      transactionName,
      timestamp,
    }

    events.push(updateClientEvent)

    const previousClientGroup =
      await dataSources.clientGroups.collection.findOne({
        _id: client.clientGroupId,
      })

    const shouldUpdateClientGroup = [
      String(previousClientGroup.presidentId),
      String(previousClientGroup.cashierId),
      String(previousClientGroup.secretaryId),
    ].includes(String(clientId))

    if (shouldUpdateClientGroup) {
      const updateClientGroupEventPayload = {}

      if (String(previousClientGroup.presidentId) === String(clientId)) {
        updateClientGroupEventPayload['presidentId'] = undefined
      } else if (String(previousClientGroup.cashierId) === String(clientId)) {
        updateClientGroupEventPayload['cashierId'] = undefined
      } else {
        updateClientGroupEventPayload['secretaryId'] = undefined
      }

      const updateClientGroupEvent = {
        _id: ObjectId(),
        type: 'update',
        obj: 'clientGroup',
        objId: client.clientGroupId,
        payload: updateClientGroupEventPayload,
        userId,
        parentId,
        transactionName,
        timestamp,
      }

      events.push(updateClientGroupEvent)
    }

    const clientGroup = await dataSources.clientGroups.collection.findOne({
      _id: clientGroupId,
    })

    if (
      clientGroup.meeting.dayOfWeek !== previousClientGroup.meeting.dayOfWeek
    ) {
      const today = moment().tz(timezone)

      const holidays = await dataSources.holidays.collection.find().toArray()

      const loans = await dataSources.loans.collection
        .find({
          clientId,
          status: 'active',
        })
        .toArray()

      loans.forEach(loan => {
        const firstFutureInstallment = loan.installments.findIndex(
          installment =>
            moment(installment.due).tz(timezone).isAfter(today, 'day')
        )

        if (firstFutureInstallment !== -1) {
          const initialInstallment =
            firstFutureInstallment > 0 ? firstFutureInstallment - 1 : 0

          const initialDueDate = moment(
            loan.installments[initialInstallment].due
          )
            .tz(timezone)
            .isoWeekday(clientGroup.meeting.dayOfWeek)
            .add(initialInstallment > 0 ? 1 : 0, 'week')

          if (
            today.isoWeekday() !== previousClientGroup.meeting.dayOfWeek &&
            clientGroup.meeting.dayOfWeek <
              previousClientGroup.meeting.dayOfWeek &&
            initialDueDate.week() ===
              moment(loan.installments[initialInstallment].due).week()
          ) {
            initialDueDate.add(1, 'week')
          }

          if (initialDueDate.isBefore(today, 'day')) {
            initialDueDate.add(1, 'week')
          }

          if (initialDueDate.isBefore(today, 'day')) {
            initialDueDate.add(1, 'week')
          }

          const dueDates = generateDueDates({
            initialDueDate,
            numberOfDueDates: loan.duration.value - initialInstallment,
            frequencyOfDueDates: loan.duration.unit,
            holidays: holidays,
            futureOnly: false,
          })

          let changedInstallments = 0

          const installments = loan.installments.map(installment => {
            if (moment(installment.due).tz(timezone).isAfter(today, 'day')) {
              installment.due = dueDates[changedInstallments].toDate()

              changedInstallments++
            } else {
              installment.due = moment(installment.due).tz(timezone).toDate()
            }

            return installment
          })

          const updateLoanEvent = {
            _id: ObjectId(),
            type: 'update',
            obj: 'loan',
            objId: loan._id,
            payload: { installments },
            userId,
            parentId,
            transactionName,
            timestamp,
          }

          events.push(updateLoanEvent)
        }
      })
    }

    await Promise.all(events.map(event => eventProcessor.addEvent(event)))

    return { status: 'ok' }
  },
  presidentId: async (parent, __, { dataSources }) => {
    return dataSources.clients.collection.findOne({
      _id: parent.presidentId,
    })
  },
  secretaryId: async (parent, __, { dataSources }) => {
    return dataSources.clients.collection.findOne({
      _id: parent.secretaryId,
    })
  },
}

module.exports = resolvers
