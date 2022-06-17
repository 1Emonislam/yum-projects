const _ = require('lodash')
const { ObjectId } = require('mongodb')
const { ForbiddenError, UserInputError } = require('apollo-server-fastify')
const moment = require('moment-timezone')

const { buildAuthorizedQuery } = require('../utils')
const { defineAbilityFor } = require('../utils/defineAbility')

const {
  countCumulativeRealization,
  generateInstallments,
  generateInstallmentsStartDate,
} = require('../utils')

const amortization = require('./legacy/amortization')
const exportLoanReport = require('./legacy/exportLoanReport')
const updateLoan = require('./legacy/updateLoan')
const updateLoanAfterMeeting = require('./legacy/updateLoanAfterMeeting')

const monthlyLoanProductId = '61e9727f2c9f250dfb1163ee'

const tz = process.env.TIMEZONE

const resolvers = {
  amortization,
  collectInstallmentAsNonLoanOfficer: async (
    __,
    argv,
    { dataSources, eventProcessor, user }
  ) => {
    if (!['branchManager', 'admin'].includes(user.role)) {
      throw new ForbiddenError('Invalid user role')
    }

    const {
      argumentation,
      cashCollectionDay,
      installmentId,
      loanId,
      mode,
      realization,
      source,
    } = argv?.input

    const loan = await dataSources.loans.collection.findOne({
      _id: ObjectId(loanId),
    })

    if (!loan) {
      throw new UserInputError('Loan not found', {
        argumentName: 'loanId',
      })
    }

    const client = await dataSources.clients.collection.findOne({
      _id: ObjectId(loan.clientId),
    })

    if (!client) {
      throw new Error('Client not found')
    }

    const openingSecurityBalance = client.securityBalance || 0

    const interestAmount = loan.approvedAmount * (loan.interestRate / 100)

    const disbursedAmount = loan.approvedAmount + interestAmount

    const cumulativeRealization = countCumulativeRealization(loan.installments)

    const outstandingAmount = disbursedAmount - cumulativeRealization

    if (source === 'security' && outstandingAmount > openingSecurityBalance) {
      throw new Error('Invalid realization source')
    }

    let closingSecurityBalance = openingSecurityBalance - realization

    if (closingSecurityBalance < 0) {
      closingSecurityBalance = 0
    }

    const changeInSecurityBalance =
      !client.securityBalance ||
      client.securityBalance !== closingSecurityBalance

    const todaysRealizationSecurityAmount =
      (closingSecurityBalance - openingSecurityBalance) * -1

    const todaysRealizationSecurity =
      source === 'security' ? todaysRealizationSecurityAmount : 0

    const todaysRealizationCash = realization - todaysRealizationSecurity

    let events = []

    const conditionalInstallmentId = installmentId
      ? { installmentId: ObjectId(installmentId) }
      : {}

    const cashCollectionDayValue =
      mode === 'repayment' ? cashCollectionDay : 'today'

    const domainEvent = {
      _id: new ObjectId(),
      type: 'collectInstallment',
      payload: {
        branchId: loan.branchId,
        loanId: ObjectId(loanId),
        ...conditionalInstallmentId,
        todaysRealization: realization,
        todaysRealizationSecurity,
        todaysRealizationCash,
        source,
        argumentation,
        cashCollectionDay: cashCollectionDayValue,
      },
      meta: 'Collection as a non-Loan Officer',
      transactionName: 'COLLECT_INSTALLMENT',
    }

    events.push(domainEvent)

    const updatedLoan = updateLoanAfterMeeting({
      loan,
      mode,
      installmentUpdate: {
        _id: installmentId,
        todaysRealization: realization,
      },
      userRole: user.role,
    })

    const updateLoanEvent = {
      type: 'update',
      obj: 'loan',
      objId: ObjectId(loanId),
      payload: updatedLoan,
      parentId: domainEvent._id,
      transactionName: 'COLLECT_INSTALLMENT',
    }

    events.push(updateLoanEvent)

    if (source === 'security' || updatedLoan.status === 'repaid') {
      const conditionalSecurityBalance =
        source === 'security' && changeInSecurityBalance
          ? {
              securityBalance: closingSecurityBalance,
            }
          : {}

      const loanHasBeenRepaid = updatedLoan.status === 'repaid'

      const clientDoesNotHaveSecurity =
        source === 'security'
          ? closingSecurityBalance === 0
          : openingSecurityBalance === 0

      const otherActiveLoans = await dataSources.loans.collection
        .find({
          _id: { $ne: ObjectId(loanId) },
          clientId: client._id,
          status: 'active',
        })
        .toArray()

      const clientHasNoMoreActiveLoans = otherActiveLoans.length === 0

      const conditionalStatus =
        loanHasBeenRepaid &&
        clientDoesNotHaveSecurity &&
        clientHasNoMoreActiveLoans
          ? { status: 'inactive', passbook: false }
          : {}

      const updateClientEvent = {
        type: 'update',
        obj: 'client',
        objId: client._id,
        payload: {
          ...conditionalStatus,
          ...conditionalSecurityBalance,
        },
        parentId: domainEvent._id,
        transactionName: 'COLLECT_INSTALLMENT',
      }

      events.push(updateClientEvent)
    }

    if (source === 'security') {
      const updateSecurityBalancesEvent = {
        type: 'create',
        obj: 'securityTransaction',
        objId: new ObjectId(),
        payload: {
          date: moment().tz(tz).toDate(),
          branchId: loan.branchId,
          clientId: client._id,
          loanId: ObjectId(loanId),
          comment: 'Installment(s) collected by a non-Loan Officer',
          openingSecurityBalance,
          closingSecurityBalance,
          change: closingSecurityBalance - openingSecurityBalance,
        },
        parentId: domainEvent._id,
        transactionName: 'COLLECT_INSTALLMENT',
      }

      events.push(updateSecurityBalancesEvent)
    }

    const installmentDetails = loan.installments.find(
      installment => String(installment._id) === installmentId
    )

    if (
      cashCollectionDayValue === 'installmentDays' &&
      moment(installmentDetails.due).tz(tz).isBefore(moment().tz(tz), 'day')
    ) {
      const cashAtHandForms = await dataSources.cashAtHandForms.collection
        .find({
          branchId: loan.branchId,
          dateIso: {
            $gt: moment(installmentDetails.due).tz(tz).startOf('day').toDate(),
          },
        })
        .toArray()

      if (cashAtHandForms.length > 0) {
        cashAtHandForms.forEach(form =>
          events.push({
            type: 'update',
            obj: 'cashAtHandForm',
            objId: form._id,
            payload: {
              closed: false,
              unlockReason: 'Modification of loan ' + loan._id,
            },
            parentId: domainEvent._id,
            transactionName: 'COLLECT_INSTALLMENT',
          })
        )
      }
    }

    await Promise.all(events.map(event => eventProcessor.addEvent(event)))

    return { status: true }
  },
  disburseLoan: async (__, argv, { dataSources, eventProcessor, user }) => {
    const { cheque, loanId, photo, signatures } = argv?.input

    const userId = user._id

    const loan = await dataSources.loans.collection.findOne({
      _id: ObjectId(loanId),
    })

    if (!loan) {
      throw new UserInputError('Loan not found', {
        argumentName: 'loanId',
      })
    }

    const clientGroup = await dataSources.clientGroups.collection.findOne({
      _id: loan.clientGroupId,
    })

    if (!clientGroup) {
      throw new Error('Client group not found')
    }

    const client = await dataSources.clients.collection.findOne({
      _id: ObjectId(loan.clientId),
    })

    if (!client) {
      throw new Error('Client not found')
    }

    const cashCollateral = loan.approvedAmount * (loan.cashCollateral / 100)

    let events = []

    const domainEvent = {
      _id: new ObjectId(),
      type: 'disburseLoan',
      userId: ObjectId(userId),
      timestamp: new Date(),
      payload: {
        loanId: ObjectId(loanId),
      },
      transactionName: 'DISBURSE_LOAN',
    }

    events.push(domainEvent)

    const updateLoanEvent = {
      _id: new ObjectId(),
      type: 'update',
      obj: 'loan',
      objId: ObjectId(loanId),
      userId: ObjectId(String(userId)),
      payload: {
        status: 'active',
        signatures: signatures,
        disbursementAt: moment().toDate(),
        disbursementMethod: cheque ? 'cheque' : 'cash',
        disbursementPhoto: photo,
        installments: generateInstallments({
          principal: loan.approvedAmount,
          duration: loan.duration,
          interestRateInPercents: loan.interestRate,
          startDate: generateInstallmentsStartDate({
            dayOfWeek: clientGroup.meeting.dayOfWeek,
            frequency: clientGroup.meeting.frequency,
            clientGroupStartedAt: clientGroup.meeting.startedAt,
            gracePeriod: loan.gracePeriod,
          }),
          holidays: await dataSources.holidays.collection.find().toArray(),
          toDate: true,
        }),
      },
      timestamp: new Date(),
      parentId: domainEvent._id,
      transactionName: 'DISBURSE_LOAN',
    }

    events.push(updateLoanEvent)

    const securityBalance =
      !client.securityBalance || client.securityBalance < cashCollateral
        ? {
            securityBalance: cashCollateral,
          }
        : {}

    const updateClientEvent = {
      _id: new ObjectId(),
      type: 'update',
      obj: 'client',
      objId: client._id,
      userId: ObjectId(String(userId)),
      payload: {
        status: 'active',
        ...securityBalance,
      },
      timestamp: new Date(),
      parentId: domainEvent._id,
      transactionName: 'DISBURSE_LOAN',
    }

    events.push(updateClientEvent)

    if (!client.securityBalance || client.securityBalance < cashCollateral) {
      const updateSecurityBalancesEvent = {
        _id: new ObjectId(),
        type: 'create',
        obj: 'securityTransaction',
        objId: new ObjectId(),
        userId: ObjectId(String(userId)),
        payload: {
          date: moment().tz(tz).toDate(),
          branchId: loan.branchId,
          clientId: client._id,
          loanId: ObjectId(loanId),
          comment: 'Loan disbursement',
          openingSecurityBalance: client.securityBalance || 0,
          closingSecurityBalance: cashCollateral,
          change: cashCollateral - (client.securityBalance || 0),
        },
        timestamp: new Date(),
        parentId: domainEvent._id,
        transactionName: 'DISBURSE_LOAN',
      }

      events.push(updateSecurityBalancesEvent)
    }

    await Promise.all(events.map(event => eventProcessor.addEvent(event)))

    return { status: true }
  },
  exportLoanReport,
  loan: async (__, argv, { dataSources }) => {
    const loanId = argv?.query?._id

    const loanOfficerId =
      argv?.query?.clientId?.clientGroupId?.loanOfficerId?._id

    const branchId = argv?.query?.clientId?.clientGroupId?.branchId?._id

    if (loanOfficerId || branchId) {
      const id = loanId ? { _id: ObjectId(loanId) } : {}

      const loanOfficer = loanOfficerId
        ? { 'client.clientGroup.loanOfficerId': ObjectId(loanOfficerId) }
        : {}

      const branchManager = branchId
        ? { 'client.clientGroup.branchId': ObjectId(branchId) }
        : {}

      const data = await dataSources.loans.collection
        .aggregate([
          {
            $lookup: {
              from: 'clients',
              localField: 'clientId',
              foreignField: '_id',
              as: 'client',
            },
          },
          {
            $unwind: {
              path: '$client',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'clientGroups',
              localField: 'client.clientGroupId',
              foreignField: '_id',
              as: 'client.clientGroup',
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
              ...id,
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

    return dataSources.loans.collection.findOne({
      _id: ObjectId(loanId),
    })
  },
  loanId: async (parent, __, { dataSources }) => {
    return dataSources.loans.collection.findOne({
      _id: parent.loanId,
    })
  },
  loans: async (__, argv, { dataSources, user }, info) => {
    const ability = defineAbilityFor(user)
    const authorizedQuery = buildAuthorizedQuery(ability, 'ClientGroup', 'read')

    const fieldNode = info.fieldNodes.find(
      field => field.name.value === info.fieldName
    )

    const project = fieldNode.selectionSet.selections.reduce(
      (project, selection) => ({
        ...project,
        [selection.name.value]: 1,
      }),
      {}
    )

    // The main query

    let query = {}

    let limit = 0

    const clientId = argv?.query?.clientId?._id

    const clientIdIn = argv?.query?.clientId?._id_in

    const status = argv?.query?.status

    const statusIn = argv?.query?.status_in

    const statusNin = argv?.query?.status_nin

    const idLt = argv?.query?._id_lt

    const formsExists = argv?.query?.forms_exists

    const limitNumber = argv?.limit

    const clientGroupId = argv?.query?.clientId?.clientGroupId?._id

    const loanOfficerId =
      argv?.query?.clientId?.clientGroupId?.loanOfficerId?._id

    const branchId = argv?.query?.clientId?.clientGroupId?.branchId?._id

    if (clientId) {
      query.clientId = ObjectId(clientId)
    }

    if (clientIdIn) {
      query.clientId = {
        $in: clientIdIn.map(id => ObjectId(id)),
      }
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

    if (formsExists) {
      query.forms = {
        $exists: true,
      }
    }

    if (limitNumber) {
      limit = limitNumber
    }

    if (clientGroupId) {
      query.clientGroupId = ObjectId(clientGroupId)
    }

    if (loanOfficerId) {
      query.loanOfficerId = ObjectId(loanOfficerId)
    }

    if (branchId) {
      query.branchId = ObjectId(branchId)
    }

    const clientGroupQuery = { ...authorizedQuery }

    const clientGroupStatusIn = argv?.query?.clientId?.clientGroupId?.status_in

    const clientGroupStatusNin =
      argv?.query?.clientId?.clientGroupId?.status_nin

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

    const clientGroups = await dataSources.clientGroups.collection
      .find(clientGroupQuery)
      .toArray()

    const loans = await dataSources.loans.collection
      .find({
        ...query,
        clientGroupId: { $in: clientGroups.map(cg => cg._id) },
      })
      .project(project)
      .sort({ _id: -1 })
      .limit(limit)
      .toArray()

    return loans
  },
  loansToDisburse: async (__, argv, { dataSources }, info) => {
    const fieldNode = info.fieldNodes.find(
      field => field.name.value === info.fieldName
    )

    const project = fieldNode.selectionSet.selections.reduce(
      (project, selection) => ({
        ...project,
        [selection.name.value]: 1,
      }),
      {}
    )

    const branchId = argv?.query?.branchId?._id

    let query = {
      status: 'approvedByManager',
      forms: {
        $exists: true,
      },
      branchId: ObjectId(branchId),
    }

    const clientGroups = await dataSources.clientGroups.collection
      .find(
        {
          branchId: ObjectId(branchId),
          status: 'active',
        },
        { _id: 1 }
      )
      .toArray()

    const loansToFilter = await dataSources.loans.collection
      .find({
        ...query,
        clientGroupId: { $in: clientGroups.map(cg => cg._id) },
      })
      .project(project)
      .sort({ _id: -1 })
      .toArray()

    const activeLoansOfClientsWithLoansToFilter =
      await dataSources.loans.collection
        .find(
          {
            clientId: { $in: loansToFilter.map(loan => loan.clientId) },
            status: 'active',
          },
          { clientId: 1, loanProductId: 1 }
        )
        .toArray()

    const loans = loansToFilter.filter(loan => {
      const clientLoans = activeLoansOfClientsWithLoansToFilter.filter(
        l => String(l.clientId) === String(loan.clientId)
      )

      if (clientLoans.length > 1) {
        return false
      }

      if (clientLoans.length === 1) {
        if (
          String(clientLoans[0].loanProductId) !== monthlyLoanProductId &&
          String(loan.loanProductId) !== monthlyLoanProductId
        ) {
          return false
        }
      }

      return true
    })

    return loans
  },
  // TODONOT: loansByClientGroupId (unused)
  loansCount: async (__, ___, { dataSources }) => {
    return dataSources.loans.collection.find().count()
  },
  updateLoan,
  withdrawSecurity: async (__, argv, { dataSources, eventProcessor, user }) => {
    const { clientId, amount, argumentation } = argv?.input

    if (!['branchManager', 'admin'].includes(user.role)) {
      throw new ForbiddenError('Invalid user role')
    }

    const client = await dataSources.clients.collection.findOne({
      _id: ObjectId(clientId),
    })

    if (!client) {
      throw new Error('Client not found')
    }

    if (!client.securityBalance || client.securityBalance <= 0) {
      throw new Error('No security balance to withdraw')
    }

    const clientGroup = await dataSources.clientGroups.collection.findOne({
      _id: client.clientGroupId,
    })

    if (!clientGroup) {
      throw new Error('Client group not found')
    }

    const outstandingLoans = await dataSources.loans.collection
      .find({
        clientId: client._id,
        status: { $ne: 'repaid' },
      })
      .toArray()

    if (outstandingLoans.length > 0) {
      const outstandingNonProductFinancingLoans = outstandingLoans.filter(
        loan => {
          // FIXME: A temporary way of saying "I'm a product financing loan"

          if (loan.duration.value === 4 && loan.duration.unit === 'week') {
            return false
          }

          return true
        }
      )

      if (outstandingNonProductFinancingLoans.length > 0) {
        throw new Error('Client has an outstanding loan')
      }
    }

    const openingSecurityBalance = client.securityBalance || 0

    const closingSecurityBalance = (client.securityBalance || 0) - amount

    const clientDoesNotHaveSecurity = closingSecurityBalance === 0

    let events = []

    const domainEvent = {
      _id: new ObjectId(),
      type: 'withdrawSecurity',
      payload: {
        clientId: client._id,
        amount,
        openingSecurityBalance,
        closingSecurityBalance,
        argumentation,
      },
      transactionName: 'WITHDRAW_SECURITY',
    }

    events.push(domainEvent)

    const conditionalStatus = clientDoesNotHaveSecurity
      ? { status: 'inactive', passbook: false }
      : {}

    const updateClientEvent = {
      type: 'update',
      obj: 'client',
      objId: client._id,
      payload: {
        ...conditionalStatus,
        securityBalance: closingSecurityBalance,
      },
      parentId: domainEvent._id,
      transactionName: 'WITHDRAW_SECURITY',
    }

    events.push(updateClientEvent)

    const updateSecurityBalancesEvent = {
      type: 'create',
      obj: 'securityTransaction',
      objId: new ObjectId(),
      payload: {
        date: moment().tz(tz).toDate(),
        branchId: clientGroup.branchId,
        clientId: client._id,
        comment: 'Security withdrawal',
        openingSecurityBalance,
        closingSecurityBalance,
        change: closingSecurityBalance - openingSecurityBalance,
      },
      parentId: domainEvent._id,
      transactionName: 'WITHDRAW_SECURITY',
    }

    events.push(updateSecurityBalancesEvent)

    await Promise.all(events.map(event => eventProcessor.addEvent(event)))

    return { status: true }
  },
}

module.exports = resolvers
