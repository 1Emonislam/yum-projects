const moment = require('moment-timezone')
const { ObjectId } = require('mongodb')

const isHoliday = require('./legacy/isHoliday')

const dateFormat = 'DD.MM.YYYY'

const tz = process.env.TIMEZONE

const asyncFilter = async (arr, predicate) =>
  Promise.all(arr.map(predicate)).then(results =>
    arr.filter((_v, index) => results[index])
  )

const isThereClientGroupMeetingThatDay = (date, clientGroup) => {
  const { dayOfWeek, frequency, startedAt } = clientGroup.meeting

  if (startedAt) {
    if (date.isBefore(moment(startedAt).tz(tz), 'day')) {
      return false
    }
  }

  if (frequency === 'weekly') {
    return true
  } else if (frequency === 'biweekly') {
    const test = date.diff(startedAt, 'weeks')

    return test % 2 === 0
  } else if (frequency === 'monthly') {
    const test = date.startOf('month').isoWeekday(dayOfWeek)

    if (date.month() !== test.month()) {
      test.add(1, 'week')
    }

    if (date.isSame(test, 'day')) {
      return true
    }
  } else {
    throw new Error('Unhandled frequency')
  }
}

const isLoanActive = (loan = {}) => {
  const { approvedAmount = null } = loan
  if (approvedAmount === null) {
    return false
  }
  const { installments = [] } = loan
  const active = installments.some(
    installment =>
      installment.status === 'late' || installment.status === 'future'
  )

  return active
}

const getLoanWithTodayInstallments = (date, loan) => {
  const { installments = [] } = loan

  const hasInstallmentWithSameDay = installments.some(installment =>
    moment(installment.due).tz(tz).isSame(date, 'day')
  )

  const hasNoFutureInstallment = installments.every(
    installment => installment.status !== 'future'
  )
  const hasSomeLateInstallment = installments.some(
    installment => installment.status === 'late'
  )

  const result =
    hasInstallmentWithSameDay ||
    (hasNoFutureInstallment && hasSomeLateInstallment)

  return result
}

const getInstallmentStatusForMeetingFromLoan = (date, loan) => {
  const {
    _id: loanId,
    approvedAmount,
    installments = [],
    clientId,
    clientGroupId,
    loanOfficerId,
    branchId,
  } = loan

  let currentInstallment = installments.find(installment =>
    moment(installment.due).tz(tz).isSame(date, 'day')
  )
  if (!currentInstallment) {
    currentInstallment = installments
      .reverse()
      .find(installment => installment.status === 'late')
  }
  const cumulativeRealization = installments.reduce((acc, installment = {}) => {
    const { realization = 0, total, target } = installment
    return acc + realization + (total - target)
  }, 0)
  const installment =
    currentInstallment.status === 'late' ? 0 : currentInstallment.target
  const overdueInstallments = installments.filter(
    installment => installment.status === 'late'
  )
  const sums = overdueInstallments.reduce(
    (acc, installment) => {
      return {
        target: acc.target + (installment.target || 0),
        realization: acc.realization + (installment.realization || 0),
      }
    },
    {
      target: 0,
      realization: 0,
    }
  )

  const overdue = sums.target - sums.realization

  const disbursedAmount = installments?.reduce(
    (acc, installment) => acc + installment.total,
    0
  )

  const openingBalance = disbursedAmount - cumulativeRealization

  return {
    _id: currentInstallment._id,
    approvedAmount,
    branchId,
    clientId,
    clientGroupId,
    loanOfficerId,
    cumulativeRealization,
    durationValue: loan.duration.value,
    durationUnit: loan.duration.unit,
    installment,
    loanId,
    openingBalance,
    overdue,
    overdueInstallments: overdueInstallments.length,
  }
}

const correctStatuses = (date, loan) => {
  const now = date.startOf('day')
  let { installments = [] } = loan
  const newInstallments = installments.map(installment => {
    const { due, status } = installment
    const momentDue = moment(due)
    let newStatus = status

    if (momentDue.isBefore(now) && status !== 'paid') {
      newStatus = 'late'
    } else if (momentDue.isSameOrAfter(now) && status !== 'paid') {
      newStatus = 'future'
    }

    return {
      ...installment,
      status: newStatus,
    }
  })

  return {
    ...loan,
    installments: newInstallments,
  }
}

const getBMCollections = async (
  date,
  dataSources,
  todaysRealizationFromNonLoanOfficersInstallmentDaysEventsFiltered = [],
  todaysRealizationFromNonLoanOfficersLegacyEvents = [],
  options = {}
) => {
  const todaysRealizationFromNonLoanOfficersTodayEvents =
    await dataSources.events.collection
      .find({
        transactionName: 'COLLECT_INSTALLMENT',
        meta: 'Collection as a non-Loan Officer',
        'payload.branchId': options.branchId,
        'payload.todaysRealizationCash': { $gt: 0 },
        'payload.cashCollectionDay': 'today',
        timestamp: {
          $gte: moment(date, dateFormat).tz(tz).startOf('day').toDate(),
          $lte: moment(date, dateFormat).tz(tz).endOf('day').toDate(),
        },
      })
      .toArray()

  const nonLoanOfficerCollectionEvents = [
    ...todaysRealizationFromNonLoanOfficersTodayEvents,
    ...todaysRealizationFromNonLoanOfficersInstallmentDaysEventsFiltered,
    ...todaysRealizationFromNonLoanOfficersLegacyEvents,
  ]

  const loans = await dataSources.loans.collection
    .find({
      _id: {
        $in: nonLoanOfficerCollectionEvents.map(
          c => c.payload.loanId || c.loanId
        ),
      },
    })
    .toArray()

  const clients = await dataSources.clients.collection
    .find({
      _id: { $in: loans.map(loan => loan.clientId) },
    })
    .toArray()

  const clientGroups = await dataSources.clientGroups.collection
    .find({
      _id: { $in: clients.map(client => client.clientGroupId) },
    })
    .toArray()

  const loanOfficers = await dataSources.users.collection
    .find({
      _id: { $in: clientGroups.map(clientGroup => clientGroup.loanOfficerId) },
    })
    .toArray()

  const nonLoanOfficerCollections = nonLoanOfficerCollectionEvents.map(c => {
    const loan = loans.find(l => l._id.equals(c.payload.loanId))

    const client = clients.find(c => String(c._id) === String(loan.clientId))

    const clientGroup = clientGroups.find(
      g => String(g._id) === String(client.clientGroupId)
    )

    const loanOfficerId = clientGroup.loanOfficerId

    const loanOfficer = loanOfficers.find(
      o => String(o._id) === String(loanOfficerId)
    )

    return {
      ...c.payload,
      ...loan,
      loanOfficerName: `${loanOfficer.lastName}, ${loanOfficer.firstName}`,
      loanOfficerId,
    }
  })

  if (options.loanOfficerId) {
    return nonLoanOfficerCollections.filter(collection =>
      collection.loanOfficerId.equals(options.loanOfficerId)
    )
  } else if (options.clientGroupId) {
    return nonLoanOfficerCollections.filter(collection =>
      collection.clientGroupId.equals(options.clientGroupId)
    )
  }

  return nonLoanOfficerCollections
}

const loanEditAwareRealizationHelper = async (
  dataSources,
  clientGroupsMeetings,
  branchId,
  dateParsed
) => {
  const editedLoansFromClientGroupMeetings = await dataSources.loans.collection
    .find(
      {
        _id: {
          $in: clientGroupsMeetings.flatMap(meeting =>
            meeting.installments.map(installment => installment.loanId)
          ),
        },
        edited: true,
      },
      {
        _id: 1,
        installments: 1,
      }
    )
    .toArray()

  const edits = await dataSources.events.collection
    .find(
      {
        type: 'update',
        obj: 'loan',
        objId: {
          $in: editedLoansFromClientGroupMeetings.map(loan => loan._id),
        },
        transactionName: 'EDIT_LOAN',
      },
      {
        objId: 1,
        timestamp: 1,
      }
    )
    .sort({ timestamp: -1 })
    .toArray()

  const editedLoansOutsideOfClientGroupMeetings =
    await dataSources.loans.collection
      .find(
        {
          _id: {
            $nin: clientGroupsMeetings.flatMap(meeting =>
              meeting.installments.map(installment => installment.loanId)
            ),
          },
          installments: {
            $elemMatch: {
              due: {
                $gte: dateParsed.startOf('day').toDate(),
                $lte: dateParsed.endOf('day').toDate(),
              },
            },
          },
          status: 'active',
          edited: true,
          branchId,
        },
        {
          _id: 1,
          installments: 1,
        }
      )
      .toArray()

  const clients = await dataSources.clients.collection
    .find({
      _id: {
        $in: editedLoansOutsideOfClientGroupMeetings.map(loan => loan.clientId),
      },
    })
    .toArray()

  const clientGroups = await dataSources.clientGroups.collection
    .find({
      _id: { $in: clients.map(client => client.clientGroupId) },
    })
    .toArray()

  const todaysRealizationFromEditedLoansInstallments =
    editedLoansOutsideOfClientGroupMeetings.map(loan => {
      const installmentFromEditedLoan = loan.installments.find(installment =>
        moment(installment.due).tz(tz).isSame(dateParsed, 'day')
      )

      const client = clients.find(c => String(c._id) === String(loan.clientId))

      const clientGroup = clientGroups.find(
        g => String(g._id) === String(client.clientGroupId)
      )

      return {
        ...installmentFromEditedLoan,
        loanOfficerId: clientGroup.loanOfficerId,
        clientGroupId: clientGroup._id,
        clientId: client._id,
      }
    })

  const activeLoansFromBranchWithInstallmentsToday =
    await dataSources.loans.collection
      .find(
        {
          installments: {
            $elemMatch: {
              due: {
                $gte: dateParsed.startOf('day').toDate(),
                $lte: dateParsed.endOf('day').toDate(),
              },
            },
          },
          status: 'active',
          branchId,
        },
        { _id: 1, installments: 1 }
      )
      .toArray()

  const todaysRealizationFromNonLoanOfficersInstallmentDaysEvents =
    await dataSources.events.collection
      .find({
        transactionName: 'COLLECT_INSTALLMENT',
        meta: 'Collection as a non-Loan Officer',
        'payload.loanId': {
          $in: activeLoansFromBranchWithInstallmentsToday.map(loan => loan._id),
        },
        'payload.branchId': branchId,
        'payload.todaysRealizationCash': { $gt: 0 },
        'payload.cashCollectionDay': 'installmentDays',
      })
      .toArray()

  const todaysRealizationFromNonLoanOfficersInstallmentDaysEventsFiltered =
    todaysRealizationFromNonLoanOfficersInstallmentDaysEvents.filter(event => {
      const { loanId, installmentId } = event.payload

      const loan = activeLoansFromBranchWithInstallmentsToday.find(
        loan => String(loan._id) === String(loanId)
      )

      if (loan) {
        const installment = loan.installments.find(
          installment =>
            String(installment._id) === String(installmentId) &&
            moment(installment.due).tz(tz).isSame(dateParsed, 'day')
        )

        if (installment) {
          return true
        }
      }

      return false
    })

  const todaysRealizationFromNonLoanOfficersLegacyEvents =
    await dataSources.events.collection
      .find({
        transactionName: 'COLLECT_INSTALLMENT',
        meta: 'Collection as a non-Loan Officer',
        'payload.branchId': branchId,
        'payload.todaysRealizationCash': { $gt: 0 },
        'payload.cashCollectionDay': { $exists: false },
        timestamp: {
          $gte: dateParsed.startOf('day').toDate(),
          $lte: dateParsed.endOf('day').toDate(),
        },
      })
      .toArray()

  return {
    edits,
    editedLoansFromClientGroupMeetings,
    todaysRealizationFromNonLoanOfficersInstallmentDaysEventsFiltered,
    editedLoansOutsideOfClientGroupMeetings,
    todaysRealizationFromEditedLoansInstallments,
    todaysRealizationFromNonLoanOfficersLegacyEvents,
  }
}

const getLoanEditAwareRealizationFromMeetingInstallment = (
  installmentFromMeeting,
  meetingDay,
  editedLoansFromClientGroupMeetings,
  edits
) => {
  const editedLoan = editedLoansFromClientGroupMeetings.find(
    loan => String(loan._id) === String(installmentFromMeeting.loanId)
  )

  // If the loan was changed after the meeting,
  // overwrite the installment from the meeting
  // with the installment from the loan object

  if (editedLoan) {
    const lastEditEvent = edits.find(
      edit => String(edit.objId) === String(editedLoan._id)
    )

    if (lastEditEvent) {
      const lastEditDay = moment(lastEditEvent.timestamp).tz(tz)

      const meetingBeforeLastEdit = lastEditDay.isAfter(meetingDay, 'day')

      if (meetingBeforeLastEdit) {
        const installmentFromEditedLoan = editedLoan.installments.find(
          installmentFromEditedLoan =>
            moment(installmentFromEditedLoan.due)
              .tz(tz)
              .isSame(meetingDay, 'day')
        )

        if (installmentFromEditedLoan) {
          return (
            (installmentFromEditedLoan?.realization || 0) +
            (installmentFromEditedLoan.total - installmentFromEditedLoan.target)
          )
        }

        return 0
      }
    }
  }

  return installmentFromMeeting?.todaysRealization || 0
}

const checkIfInstallmentIsValidForRealizationComputation = (
  installmentFromMeeting,
  meetingDay,
  editedLoansFromClientGroupMeetings,
  todaysRealizationFromNonLoanOfficersInstallmentDaysEventsFiltered
) => {
  const editedLoan = editedLoansFromClientGroupMeetings.find(
    loan => String(loan._id) === String(installmentFromMeeting.loanId)
  )

  // Filter out installments that are affected by BM collection
  // to avoid counting them twice
  const collectionFromNonLoanOfficerIndex =
    todaysRealizationFromNonLoanOfficersInstallmentDaysEventsFiltered.findIndex(
      event =>
        String(event?.payload?.loanId) === String(installmentFromMeeting.loanId)
    )

  const collectionFromNonLoanOfficer = collectionFromNonLoanOfficerIndex !== -1

  if (collectionFromNonLoanOfficer) {
    return false
  }

  // Filter out installments that are out of date on a given day
  // due to a change in the installment schedule
  // triggered by a loan edit
  if (editedLoan) {
    const installmentIndex = editedLoan.installments.findIndex(
      installmentFromEditedLoan =>
        moment(installmentFromEditedLoan.due).tz(tz).isSame(meetingDay, 'day')
    )

    const noInstallmentScheduledForTodayInEditedLoan = installmentIndex === -1

    const noLateInstallments = !editedLoan.installments.some(installment => {
      if (moment(installment.due).tz(tz).isBefore(meetingDay, 'day')) {
        if (installment?.realization || 0 < installment.target) {
          return true
        }
      }

      return false
    })

    if (noInstallmentScheduledForTodayInEditedLoan && noLateInstallments) {
      return false
    }
  }

  return true
}

const getLoanStats = (
  clientGroupsMeetings,
  byId,
  summaryType,
  bmCollections,
  installments,
  options = {},
  clientGroups
) => {
  let realization = 0
  let advance = 0
  let odCollection = 0
  let newOverdue = 0
  let bmRealization = 0

  let targetMeetings
  let targetInstallments
  let todaysRealizationFromEditedLoans = 0
  if (summaryType === 'byLoanOfficerId') {
    targetMeetings = clientGroupsMeetings.filter(meeting => {
      const clientGroup = clientGroups.find(
        g => String(g._id) === String(meeting.clientGroupId)
      )

      return clientGroup.loanOfficerId.equals(byId)
    })

    targetInstallments = installments.filter(installment => {
      const clientGroup = clientGroups.find(
        g => String(g._id) === String(installment.clientGroupId)
      )

      return clientGroup.loanOfficerId.equals(byId)
    })

    bmRealization += bmCollections
      .filter(c => c.loanOfficerId?.equals(byId))
      .reduce((acc, c) => acc + c.todaysRealizationCash, 0)

    todaysRealizationFromEditedLoans =
      options.todaysRealizationFromEditedLoansInstallments
        .filter(installment => {
          const clientGroup = clientGroups.find(
            g => String(g._id) === String(installment.clientGroupId)
          )

          return clientGroup.loanOfficerId.equals(byId)
        })
        .reduce(
          (acc = 0, installment) => acc + installment?.realization || 0,
          0
        )
  } else if (summaryType === 'byGroupId') {
    targetMeetings = clientGroupsMeetings.filter(meeting =>
      meeting.clientGroupId.equals(byId)
    )
    targetInstallments = installments.filter(installment =>
      installment.clientGroupId.equals(byId)
    )
    bmRealization += bmCollections
      .filter(c => c.clientGroupId.equals(byId))
      .reduce((acc, c) => acc + c.todaysRealizationCash, 0)

    todaysRealizationFromEditedLoans =
      options.todaysRealizationFromEditedLoansInstallments
        .filter(installment => installment.clientGroupId.equals(byId))
        .reduce(
          (acc = 0, installment) => acc + installment?.realization || 0,
          0
        )
  } else if (summaryType === 'byClientId') {
    targetMeetings = clientGroupsMeetings.filter(meeting =>
      meeting.installments.some(installment =>
        installment.clientId.equals(byId)
      )
    )
    targetInstallments = installments.filter(installment =>
      installment.clientId.equals(byId)
    )
    bmRealization += bmCollections
      .filter(c => c.clientId.equals(byId))
      .reduce((acc, c) => acc + c.todaysRealizationCash, 0)

    todaysRealizationFromEditedLoans =
      options.todaysRealizationFromEditedLoansInstallments
        .filter(installment => installment.clientGroupId.equals(byId))
        .reduce(
          (acc = 0, installment) => acc + installment?.realization || 0,
          0
        )
  }

  // Realization is made of payment of todays target + (previous OD payment + advance payment if any)
  // NB: realization needs to factor in BM collections!
  realization += bmRealization

  realization += todaysRealizationFromEditedLoans

  for (const meeting of targetMeetings) {
    const { installments = [] } = meeting
    const meetingDay = moment(meeting.scheduledAt).tz(tz)

    for (const installment of installments) {
      if (
        summaryType !== 'byClientId' ||
        (summaryType === 'byClientId' && installment.clientId.equals(byId))
      ) {
        // Realization is made of payment of todays target + (previous OD payment + advance payment if any)
        // NB: realization needs to factor in BM collections!
        // realization += installment?.todaysRealization || 0

        const considerThisInstallment =
          checkIfInstallmentIsValidForRealizationComputation(
            installment,
            meetingDay,
            options.editedLoansFromClientGroupMeetings,
            options.todaysRealizationFromNonLoanOfficersInstallmentDaysEventsFiltered
          )

        if (considerThisInstallment) {
          const computedRealization =
            getLoanEditAwareRealizationFromMeetingInstallment(
              installment,
              meetingDay,
              options.editedLoansFromClientGroupMeetings,
              options.edits
            )

          if (computedRealization) {
            realization += computedRealization
          }
        }

        // Advance = todays realization - (what is supposed to be paid today(target) + previous OD payment)
        const currentAdvance =
          (installment?.todaysRealization || 0) -
          (installment?.installment || 0)

        //realization - realizable
        if (currentAdvance > 0) {
          advance += currentAdvance
        }

        // OD Collection = previous OD payment
        odCollection += installment?.overdue || 0

        // New Overdue = todays realization - what is supposed to be paid today(target)
        // this applies only for clients without previous(existing) OD payment
        const hasExistingODPayment = !!installment?.overdue
        if (!hasExistingODPayment && currentAdvance < 0) {
          newOverdue += Math.abs(currentAdvance)
        }
      }
    }

    // if realization is zero(no collections made that today), then OD Collection = 0
    if (realization === 0) {
      odCollection = 0
    }
  }

  // Realizable = what is supposed to be paid today(target) + previous OD payment
  const realizable = targetInstallments.reduce(
    (acc, installment) =>
      acc + (installment?.installment || 0) + (installment?.overdue || 0),
    0
  )

  return {
    realizable,
    realization,
    advance,
    odCollection,
    newOverdue,
  }
}

const resolvers = {
  loanOfficerSummary: async (_, { branchId, date }, { dataSources }) => {
    const dateParsed = moment(date, dateFormat).tz(tz)

    const doesDateFallOnAHoliday = await isHoliday(
      dataSources,
      tz,
      dateParsed,
      true
    )

    const loanOfficers = await dataSources.users.collection
      .find(
        {
          role: 'loanOfficer',
          $or: [{ isDisabled: false }, { isDisabled: { $exists: false } }],
          branchId,
        },
        { projection: { _id: 1, firstName: 1, lastName: 1 } }
      )
      .toArray()

    const clientGroups = await dataSources.clientGroups.collection
      .find({
        branchId,
        status: 'active',
        'meeting.dayOfWeek': dateParsed.isoWeekday(),
      })
      .toArray()

    const todayClientGroups = clientGroups.filter(clientGroup =>
      isThereClientGroupMeetingThatDay(dateParsed, clientGroup)
    )

    const clientGroupsIds = todayClientGroups.map(
      clientGroup => clientGroup._id
    )

    const loans = await dataSources.loans.collection
      .find({ clientGroupId: { $in: clientGroupsIds }, status: 'active' })
      .toArray()

    const installments = loans
      .map(loan => correctStatuses(dateParsed, loan))
      .filter(isLoanActive)
      .filter(loan => getLoanWithTodayInstallments(dateParsed, loan))
      .map(loan => getInstallmentStatusForMeetingFromLoan(dateParsed, loan))

    const clientGroupsMeetings =
      await dataSources.clientGroupsMeetings.collection
        .find({
          clientGroupId: { $in: clientGroupsIds },
          createdAt: {
            $gte: dateParsed.startOf('day').toDate(),
            $lte: dateParsed.endOf('day').toDate(),
          },
        })
        .toArray()

    const options = await loanEditAwareRealizationHelper(
      dataSources,
      clientGroupsMeetings,
      branchId,
      dateParsed
    )

    const bmCollections = await getBMCollections(
      date,
      dataSources,
      options.todaysRealizationFromNonLoanOfficersInstallmentDaysEventsFiltered,
      options.todaysRealizationFromNonLoanOfficersLegacyEvents,
      { branchId }
    )

    return loanOfficers.map(loanOfficer => {
      const stats = doesDateFallOnAHoliday
        ? {}
        : getLoanStats(
            clientGroupsMeetings,
            loanOfficer._id,
            'byLoanOfficerId',
            bmCollections,
            installments,
            options,
            clientGroups
          )

      const loanOfficerId = loanOfficer._id
      const loanOfficerName = `${loanOfficer.lastName}, ${loanOfficer.firstName}`

      return {
        loanOfficerId,
        loanOfficerName,
        ...stats,
      }
    })
  },
  clientGroupSummary: async (_, { loanOfficerId, date }, { dataSources }) => {
    const dateParsed = moment(date, dateFormat).tz(tz)

    const doesDateFallOnAHoliday = await isHoliday(
      dataSources,
      tz,
      dateParsed,
      true
    )

    const loanOfficer = await dataSources.users.collection.findOne(
      { _id: loanOfficerId },
      { projection: { _id: 1, firstName: 1, lastName: 1, branchId: 1 } }
    )

    const clientGroups = await dataSources.clientGroups.collection
      .find({
        loanOfficerId,
        'meeting.dayOfWeek': dateParsed.isoWeekday(),
        status: 'active',
      })
      .toArray()

    const todayClientGroups = clientGroups.filter(clientGroup =>
      isThereClientGroupMeetingThatDay(dateParsed, clientGroup)
    )

    const clientGroupsIds = todayClientGroups.map(
      clientGroup => clientGroup._id
    )

    const loans = await dataSources.loans.collection
      .find({ clientGroupId: { $in: clientGroupsIds }, status: 'active' })
      .toArray()

    const installments = loans
      .map(loan => correctStatuses(dateParsed, loan))
      .filter(isLoanActive)
      .filter(loan => getLoanWithTodayInstallments(dateParsed, loan))
      .map(loan => getInstallmentStatusForMeetingFromLoan(dateParsed, loan))

    const clientGroupsMeetings =
      await dataSources.clientGroupsMeetings.collection
        .find({
          clientGroupId: { $in: clientGroupsIds },
          createdAt: {
            $gte: dateParsed.startOf('day').toDate(),
            $lte: dateParsed.endOf('day').toDate(),
          },
        })
        .toArray()

    const options = await loanEditAwareRealizationHelper(
      dataSources,
      clientGroupsMeetings,
      loanOfficer.branchId,
      dateParsed
    )

    const bmCollections = await getBMCollections(
      date,
      dataSources,
      options.todaysRealizationFromNonLoanOfficersInstallmentDaysEventsFiltered,
      options.todaysRealizationFromNonLoanOfficersLegacyEvents,
      { branchId: loanOfficer.branchId, loanOfficerId }
    )

    return clientGroups
      .map(clientGroup => {
        const stats = doesDateFallOnAHoliday
          ? {}
          : getLoanStats(
              clientGroupsMeetings,
              clientGroup._id,
              'byGroupId',
              bmCollections,
              installments,
              options
            )

        const loanOfficerId = loanOfficer._id
        const loanOfficerName = `${loanOfficer.lastName}, ${loanOfficer.firstName}`
        const clientGroupName = clientGroup.name
        const clientGroupId = clientGroup._id
        const clientGroupMeetingDayOfWeek = clientGroup.meeting.dayOfWeek

        return {
          loanOfficerId,
          loanOfficerName,
          clientGroupId,
          clientGroupName,
          clientGroupMeetingDayOfWeek,
          ...stats,
        }
      })
      .filter(
        clientGroup =>
          clientGroup.realization > 0 ||
          clientGroup.clientGroupMeetingDayOfWeek === dateParsed.isoWeekday()
      )
      .sort((a, b) => a.clientGroupName.localeCompare(b.clientGroupName))
  },
  clientSummary: async (_, { clientGroupId, date }, { dataSources }) => {
    const dateParsed = moment(date, dateFormat).tz(tz)

    const doesDateFallOnAHoliday = await isHoliday(
      dataSources,
      tz,
      dateParsed,
      true
    )

    const clientGroup = await dataSources.clientGroups.collection.findOne(
      { _id: clientGroupId },
      { projection: { _id: 1, name: 1, loanOfficerId: 1 } }
    )

    const loanOfficer = await dataSources.users.collection.findOne(
      { _id: clientGroup.loanOfficerId },
      { projection: { _id: 1, firstName: 1, lastName: 1, branchId: 1 } }
    )

    const clientGroupsIds = [clientGroupId]

    const clients = await dataSources.clients.collection
      .find({ clientGroupId: { $in: clientGroupsIds } })
      .toArray()

    const clientsIds = clients.map(client => client._id)

    const loans = await dataSources.loans.collection
      .find({ clientId: { $in: clientsIds }, status: 'active' })
      .toArray()

    const installments = loans
      .map(loan => correctStatuses(dateParsed, loan))
      .filter(isLoanActive)
      .filter(loan => getLoanWithTodayInstallments(dateParsed, loan))
      .map(loan => getInstallmentStatusForMeetingFromLoan(dateParsed, loan))

    const clientGroupsMeetings =
      await dataSources.clientGroupsMeetings.collection
        .find({
          clientGroupId: { $in: clientGroupsIds },
          createdAt: {
            $gte: dateParsed.startOf('day').toDate(),
            $lte: dateParsed.endOf('day').toDate(),
          },
        })
        .toArray()

    const options = await loanEditAwareRealizationHelper(
      dataSources,
      clientGroupsMeetings,
      loanOfficer.branchId,
      dateParsed
    )

    const bmCollections = await getBMCollections(
      date,
      dataSources,
      options.todaysRealizationFromNonLoanOfficersInstallmentDaysEventsFiltered,
      options.todaysRealizationFromNonLoanOfficersLegacyEvents,
      { branchId: loanOfficer.branchId, clientGroupId }
    )

    return clients
      .map(client => {
        const stats = doesDateFallOnAHoliday
          ? {}
          : getLoanStats(
              clientGroupsMeetings,
              client._id,
              'byClientId',
              bmCollections,
              installments,
              options
            )

        const loanOfficerId = loanOfficer._id
        const loanOfficerName = `${loanOfficer.lastName}, ${loanOfficer.firstName}`
        const clientGroupId = clientGroup._id
        const clientGroupName = clientGroup.name
        const clientId = client._id
        const clientName = `${client.lastName}, ${client.firstName}`

        return {
          loanOfficerId,
          loanOfficerName,
          clientGroupId,
          clientGroupName,
          clientId,
          clientName,
          ...stats,
        }
      })
      .sort((a, b) => a.clientName.localeCompare(b.clientName))
  },
  bmCollectionsOverview: async (
    _,
    { branchId, date, loanOfficerId, clientGroupId },
    { dataSources }
  ) => {
    const dateParsed = moment(date, dateFormat).tz(tz)

    const todaysRealizationFromNonLoanOfficersTodayEvents =
      await dataSources.events.collection
        .find({
          transactionName: 'COLLECT_INSTALLMENT',
          meta: 'Collection as a non-Loan Officer',
          'payload.branchId': branchId,
          'payload.todaysRealizationCash': { $gt: 0 },
          'payload.cashCollectionDay': 'today',
          timestamp: {
            $gte: dateParsed.startOf('day').toDate(),
            $lte: dateParsed.endOf('day').toDate(),
          },
        })
        .toArray()

    const options = await loanEditAwareRealizationHelper(
      dataSources,
      [],
      branchId,
      dateParsed
    )

    const nonLoanOfficerCollectionEvents = [
      ...todaysRealizationFromNonLoanOfficersTodayEvents,
      ...options.todaysRealizationFromNonLoanOfficersInstallmentDaysEventsFiltered,
      ...options.todaysRealizationFromNonLoanOfficersLegacyEvents,
    ]

    const loans = await dataSources.loans.collection
      .find(
        {
          _id: {
            $in: nonLoanOfficerCollectionEvents.map(c => c.payload.loanId),
          },
        },
        {
          projection: {
            _id: 1,
            clientId: 1,
            loanOfficerId: 1,
            clientGroupId: 1,
            clientGroupName: 1,
          },
        }
      )
      .toArray()

    const clients = await dataSources.clients.collection
      .find(
        {
          _id: { $in: loans.map(l => l.clientId) },
        },
        {
          projection: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            clientGroupId: 1,
          },
        }
      )
      .toArray()

    const clientGroups = await dataSources.clientGroups.collection
      .find(
        {
          _id: { $in: clients.map(client => client.clientGroupId) },
        },
        {
          projection: {
            _id: 1,
            loanOfficerId: 1,
          },
        }
      )
      .toArray()

    const loanOfficers = await dataSources.users.collection
      .find(
        {
          _id: {
            $in: clientGroups.map(clientGroup => clientGroup.loanOfficerId),
          },
        },
        {
          projection: {
            _id: 1,
            firstName: 1,
            lastName: 1,
          },
        }
      )
      .toArray()

    const clientGroupsMeetings =
      await dataSources.clientGroupsMeetings.collection
        .find(
          {
            clientGroupId: { $in: clients.map(client => client.clientGroupId) },
          },
          {
            projection: {
              _id: 1,
              scheduledAt: 1,
              clientGroupId: 1,
            },
          }
        )
        .toArray()

    const nonLoanOfficerCollections = nonLoanOfficerCollectionEvents.map(
      bmCollectionEvent => {
        const loan = loans.find(loan =>
          loan._id.equals(bmCollectionEvent.payload.loanId)
        )
        const client = clients.find(client => client._id.equals(loan.clientId))

        const clientGroupsMeeting = clientGroupsMeetings.find(meeting =>
          meeting.clientGroupId.equals(client.clientGroupId)
        )

        const clientGroup = clientGroups.find(
          g => String(g._id) === String(client.clientGroupId)
        )

        const loanOfficer = loanOfficers.find(
          o => String(o._id) === String(clientGroup.loanOfficerId)
        )

        return {
          ...bmCollectionEvent.payload,
          ...loan,
          clientName: `${client.lastName}, ${client.firstName}`,
          loanOfficerId: loanOfficer._id,
          loanOfficerName: `${loanOfficer.lastName}, ${loanOfficer.firstName}`,
          meetingScheduledDate: clientGroupsMeeting.scheduledAt,
        }
      }
    )

    if (loanOfficerId) {
      return nonLoanOfficerCollections.filter(collection =>
        collection.loanOfficerId.equals(loanOfficerId)
      )
    } else if (clientGroupId) {
      return nonLoanOfficerCollections.filter(collection =>
        collection.clientGroupId.equals(clientGroupId)
      )
    }

    return nonLoanOfficerCollections
  },
  branchOverview: async (_, { branchId, date }, { dataSources }) => {
    const dateFilter = {
      $gte: moment(date, dateFormat).tz(tz).startOf('day').toDate(),
      $lte: moment(date, dateFormat).tz(tz).endOf('day').toDate(),
    }

    const clientGroups = await dataSources.clientGroups.collection
      .find({ branchId }, { projection: { _id: 1 } })
      .toArray()

    const clientGroupIds = clientGroups.map(clientGroup => clientGroup._id)

    const newAdmissions = await dataSources.clients.collection
      .find({
        clientGroupId: { $in: clientGroupIds },
        createdAt: dateFilter,
      })
      .toArray()

    const newLoanApplications = await dataSources.loans.collection
      .find({
        branchId,
        createdAt: dateFilter,
      })
      .toArray()

    newLoanApplications.sort((a, b) =>
      a.loanOfficerName.localeCompare(b.loanOfficerName)
    )

    const loanOfficers = await dataSources.users.collection
      .find(
        { role: 'loanOfficer', branchId },
        { projection: { _id: 1, firstName: 1, lastName: 1 } }
      )
      .toArray()

    const loanOfficersIds = loanOfficers.map(loanOfficer => loanOfficer._id)

    const clientsWithSecurityAdjustmentsLoanIds =
      await dataSources.events.collection
        .find(
          {
            userId: { $in: loanOfficersIds },
            type: 'collectInstallment',
            'payload.source': 'security',
            timestamp: dateFilter,
          },
          { projection: { loanId: 1 } }
        )
        .toArray()

    const clientsWithSecurityAdjustmentsClientIds =
      await dataSources.loans.collection
        .find(
          {
            _id: {
              $in: clientsWithSecurityAdjustmentsLoanIds.map(
                loan => loan.loanId
              ),
            },
          },
          { projection: { _id: 1, clientId: 1 } }
        )
        .toArray()

    const clientsWithSecurityAdjustments = await dataSources.clients.collection
      .find({
        _id: {
          $in: clientsWithSecurityAdjustmentsClientIds.map(
            client => client.clientId
          ),
        },
      })
      .toArray()

    const disbursements = await dataSources.loans.collection
      .find({
        branchId,
        disbursementAt: dateFilter,
        $or: [
          {
            disbursementMethod: { $exists: false },
          },
          {
            disbursementMethod: 'cash',
          },
        ],
      })
      .toArray()

    disbursements.sort((a, b) =>
      a.loanOfficerName.localeCompare(b.loanOfficerName)
    )

    const securityPayments = await dataSources.securityBalances.collection
      .find({
        branchId,
        date: dateFilter,
        comment: 'Loan disbursement',
      })
      .toArray()

    const clientsWithSecurityBalances = await dataSources.clients.collection
      .find({
        _id: {
          $in: securityPayments.map(
            securityBalance => securityBalance.clientId
          ),
        },
      })
      .toArray()

    const securityBalances = securityPayments.map(securityPayment => {
      const client = clientsWithSecurityBalances.find(client =>
        client._id.equals(securityPayment.clientId)
      )

      return {
        client,
        ...securityPayment,
      }
    })

    // passbookSaleAddedClients from CAH

    const clients = await dataSources.clients.collection
      .find(
        { clientGroupId: { $in: clientGroupIds } },
        { projection: { _id: 1 } }
      )
      .toArray()

    const clientIds = clients.map(client => client._id)

    const clientsAdded = await dataSources.clients.collection
      .find(
        {
          _id: { $in: clientIds },
          addedAt: dateFilter,
        },
        {
          projection: { _id: 1 },
        }
      )
      .toArray()

    const clientsAddedIds = clientsAdded.map(client => client._id)

    // passbookSaleActiveClients from CAH

    const passbooksProvided = await dataSources.events.collection
      .find({
        type: 'update',
        obj: 'client',
        objId: { $in: clientIds },
        'payload.passbook': true,
        timestamp: dateFilter,
      })
      .toArray()

    const passbooksProvidedToActiveClients = await asyncFilter(
      passbooksProvided,
      async event => {
        const previousPassbookRelatedEvent =
          await dataSources.events.collection.findOne({
            type: 'update',
            obj: 'client',
            objId: event.objId,
            $or: [
              { payload: { passbook: true } },
              { payload: { passbook: false } },
            ],
            timestamp: { $gt: event.timestamp },
          })

        if (previousPassbookRelatedEvent) {
          if (previousPassbookRelatedEvent.payload.passbook === false) {
            return true
          }
        }

        return false
      }
    )

    const passbooksProvidedToActiveClientsIds =
      passbooksProvidedToActiveClients.map(event => event.objId)

    // passbookSaleReactivatedClients from CAH

    const clientsReactivated = await dataSources.clients.collection
      .find(
        {
          lastRenewalAt: dateFilter,
          clientGroupId: { $in: clientGroupIds },
        },
        { projection: { _id: 1 } }
      )
      .toArray()

    const clientsReactivatedIds = clientsReactivated.map(client => client._id)

    // Turn clientIds into clients

    const query = {
      _id: {
        $in: [
          ...clientsAddedIds,
          ...passbooksProvidedToActiveClientsIds,
          ...clientsReactivatedIds,
        ],
      },
    }

    const clientsWithPassbooksIssuedOrRenewed =
      await dataSources.clients.collection.find(query).toArray()

    return {
      newAdmissions,
      newLoanApplications,
      clientsWithSecurityAdjustments,
      disbursements,
      securityBalances,
      clientsWithPassbooksIssuedOrRenewed,
    }
  },
}

module.exports = resolvers
