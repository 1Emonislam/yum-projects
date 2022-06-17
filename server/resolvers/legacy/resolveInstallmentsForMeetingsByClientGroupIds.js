const { ObjectId } = require('mongodb')

const moment = require('moment-timezone')

const timezone = process.env.TIMEZONE

// GUARDS
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

const getLoanWithTodayInstallments = loan => {
  const { installments = [] } = loan

  const hasInstallmentWithSameDay = installments.some(installment =>
    moment(installment.due).tz(timezone).isSame(moment().tz(timezone), 'day')
  )

  const hasNoFutureInstallment = installments.every(
    installment => installment.status !== 'future'
  )
  const hasSomeLateInstallment = installments.some(
    installment => installment.status === 'late'
  )

  return (
    hasInstallmentWithSameDay ||
    (hasNoFutureInstallment && hasSomeLateInstallment)
  )
}

const getInstallmentStatusForMeetingFromLoan = loan => {
  const { _id: loanId, approvedAmount, installments = [], clientId } = loan
  let currentInstallment = installments.find(installment =>
    moment(installment.due).tz(timezone).isSame(moment().tz(timezone), 'day')
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
    clientId,
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

const correctStatuses = loan => {
  const moment = require('moment-timezone')
  const now = moment().startOf('day')
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

const resolveInstallmentsForMeetingsByClientGroupIds = async (
  clientGroupIds = [],
  dataSources
) => {
  clientGroupIds = clientGroupIds.map(id => ObjectId(String(id)))

  const clients = await dataSources.clients.collection
    .find({ clientGroupId: { $in: clientGroupIds } })
    .toArray()

  const clientsIds = clients.map(client => ObjectId(String(client._id)))

  const loans = await dataSources.loans.collection
    .find({ clientId: { $in: clientsIds }, status: 'active' })
    .toArray()

  const results = loans
    .map(correctStatuses)
    .filter(isLoanActive)
    .filter(getLoanWithTodayInstallments)
    .map(getInstallmentStatusForMeetingFromLoan)

  return results
}

module.exports = resolveInstallmentsForMeetingsByClientGroupIds
