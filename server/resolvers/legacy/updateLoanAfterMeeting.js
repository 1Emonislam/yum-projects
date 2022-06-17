const moment = require('moment-timezone')

const updateLoanAfterMeeting = input => {
  const {
    loan,
    installmentUpdate,
    mode = 'repayment',
    userRole = 'loanOfficer',
  } = input

  const timezone = process.env.TIMEZONE

  let { _id, todaysRealization } = installmentUpdate

  if (mode === 'repayment' && !_id) {
    throw new Error(`_id cannot be empty`)
  }

  todaysRealization = Number(todaysRealization)

  let { installments = [] } = loan

  if (mode === 'repayment') {
    const currentIndex = installments.findIndex(
      i => String(i._id) === String(_id)
    )

    if (currentIndex === -1) {
      throw new Error(`installment with id: ${_id} not found.`)
    }

    let { target, realization, status, wasLate, openingBalance, due } =
      installments[currentIndex]

    if (!realization) {
      realization = 0
    }

    const toPay = target - realization

    if (todaysRealization < toPay) {
      realization += todaysRealization
      todaysRealization = 0

      if (
        moment(due).tz(timezone).isSameOrBefore(moment().tz(timezone), 'day')
      ) {
        wasLate = true
        status = 'late'
      }
    } else {
      realization += toPay
      todaysRealization -= toPay
      status = 'paid'
      wasLate = false
    }

    Object.assign(installments[currentIndex], {
      realization,
      status,
      openingBalance,
      wasLate,
      target,
    })

    installments = installments.map((installment, index) => {
      let { total, target, realization, status, wasLate, openingBalance } =
        installment

      // FIXME: guards for realizations
      if (typeof realization === 'string') {
        realization.replaceAll(',', '.')
      }

      realization =
        realization === null ||
        realization === 'null' ||
        realization === undefined ||
        realization === 'undefined'
          ? 0
          : Number(realization)

      if (isNaN(realization)) {
        realization = 0
      }

      // CURRENT PAYMENT NOW
      if (String(installment._id) === String(_id)) {
        return installment
      }

      // PAST DUE PAYMENTS FIRST
      const pastDuePaymentsCondition =
        userRole === 'loanOfficer'
          ? status === 'late' || index < currentIndex
          : status === 'late'

      if (pastDuePaymentsCondition) {
        const toPay = total - realization

        if (todaysRealization >= toPay) {
          realization += toPay
          todaysRealization -= toPay
          status = 'paid'
        } else {
          realization += todaysRealization
          todaysRealization = 0
          status = 'late'
          wasLate = true
        }
      }

      return {
        ...installment,
        realization,
        status,
        openingBalance,
        wasLate,
        target,
      }
    })
  }

  const futureInstallments = installments.filter(
    installment => installment.status === 'future'
  )

  for (let i = futureInstallments.length - 1; i >= 0; i--) {
    const installment = futureInstallments[i]

    if (
      installment.target - (installment.realization || 0) <=
      todaysRealization
    ) {
      todaysRealization -= installment.target - (installment.realization || 0)
      installment.target = 0
      installment.realization = 0
    } else {
      if (todaysRealization > 0) {
        const targetBeforeModification = installment.target

        installment.target = targetBeforeModification - todaysRealization

        todaysRealization =
          todaysRealization - targetBeforeModification + installment.target
      }
    }
  }

  const interestAmount = loan.approvedAmount * (loan.interestRate / 100)

  const disbursedAmount = loan.approvedAmount + interestAmount

  const cumulativeRealization = installments.reduce((acc, installment = {}) => {
    const { realization = 0, total, target } = installment
    return acc + realization + (total - target)
  }, 0)

  if (cumulativeRealization === disbursedAmount) {
    loan.status = 'repaid'
  }

  installments = installments.map(installment => {
    if (installment.target === 0) {
      installment.status = 'paid'
    }

    return installment
  })

  return {
    _id: loan._id,
    status: loan.status,
    installments,
  }
}

module.exports = updateLoanAfterMeeting
