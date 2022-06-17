const { ObjectId } = require('mongodb')
const moment = require('moment-timezone')
const { generateInstallments } = require('../../utils')

const updateLoan = async (_, { input }, { dataSources, eventProcessor }) => {
  const timezone = process.env.TIMEZONE

  const {
    _id,
    disbursement,
    firstInstallmentCollection,
    principal,
    installment,
    outstanding,
    cycle,
    duration,
    cashAtHand,
    meta,
  } = input

  const holidays = await dataSources.holidays.collection
    .find({}, { startAt: 1, endAt: 1, yearly: 1 })
    .toArray()

  const loan = await dataSources.loans.collection.findOne({
    _id: ObjectId(_id),
  })

  const client = await dataSources.clients.collection.findOne({
    _id: loan.clientId,
  })

  if (loan) {
    const loanProduct = await dataSources.loanProducts.collection.findOne({
      _id: loan.loanProductId,
    })

    let changes = {}

    changes['edited'] = true

    const disbursementDate = disbursement || loan.disbursementAt

    if (disbursement) {
      changes['disbursementAt'] = moment(disbursement).toDate()
    }

    if (principal) {
      changes['approvedAmount'] = principal
    } else {
      if (!loan.approvedAmount) {
        changes['approvedAmount'] = loan.requestedAmount
      }
    }

    if (duration) {
      changes['duration'] = {
        unit: loan.duration.unit,
        value: duration,
      }

      changes['interestRate'] = loanProduct.serviceCharges.find(
        serviceCharge =>
          serviceCharge.durationValue === duration &&
          serviceCharge.durationUnit === loan.duration.unit
      ).charge
    }

    if (cycle) {
      changes['cycle'] = cycle

      const isLoanBeforeMarch2021 = disbursementDate
        ? moment(disbursementDate).tz(timezone).isBefore('2021-03-01', 'day')
        : false

      const cashCollateralForTheInitialLoan = isLoanBeforeMarch2021
        ? 10
        : loanProduct.cashCollateral.initialLoan

      const cashCollateralForFurtherLoans = isLoanBeforeMarch2021
        ? 12.5
        : loanProduct.cashCollateral.furtherLoans

      const cashCollateral =
        cycle === 1
          ? cashCollateralForTheInitialLoan
          : cashCollateralForFurtherLoans

      changes['cashCollateral'] = cashCollateral
    }

    if (cashAtHand) {
      const startDate = firstInstallmentCollection
        ? moment(firstInstallmentCollection)
        : moment(loan.installments[0].due)

      const floorTo = installment ? { floorTo: undefined } : {}

      const interestRateInPercents = changes.interestRate || loan.interestRate

      const installments = generateInstallments({
        principal: principal || loan.approvedAmount || loan.requestedAmount,
        duration: changes.duration || loan.duration,
        overrideTarget: installment ? installment : undefined,
        toDate: true,
        interestRateInPercents,
        startDate,
        holidays,
        ...floorTo,
      })

      const amount = principal || loan.approvedAmount || loan.requestedAmount

      const disbursedAmount = amount + amount * (interestRateInPercents / 100)

      let totalRealization =
        typeof outstanding !== 'undefined'
          ? disbursedAmount - outstanding
          : loan.installments.reduce((acc, installment = {}) => {
              const { realization = 0, total, target } = installment
              return acc + realization + (total - target)
            }, 0)

      const installmentsBeforeToday = installments.filter(installment =>
        moment(installment.due).tz(timezone).isSameOrBefore(moment(), 'day')
      )

      const futureInstallments = installments.slice(
        installmentsBeforeToday.length
      )

      for (let installment of installmentsBeforeToday) {
        if (installment.target <= totalRealization) {
          installment.realization = parseInt(installment.target)
          installment.status = 'paid'
          totalRealization -= installment.total
        } else {
          if (totalRealization > 0) {
            installment.realization = parseInt(totalRealization)
            totalRealization -= installment.target
          }
        }
      }

      for (let i = futureInstallments.length - 1; i >= 0; i--) {
        const installment = futureInstallments[i]
        if (installment.total <= totalRealization) {
          installment.target = 0
          installment.status = 'paid' // TODO: Decide: Is this FIXME:?
          totalRealization -= installment.total
        } else {
          if (totalRealization > 0) {
            installment.target = parseInt(installment.total - totalRealization)
            totalRealization -= installment.total
          }
        }
      }

      const realizedAmount = installments.reduce(
        (acc, installment) =>
          acc +
          parseInt(installment.realization || 0) +
          parseInt(installment.total - installment.target || 0),
        0
      )

      const installmentsWithPreviousIds = installments.map((installment, i) => {
        const previousInstallment = loan.installments[i]

        if (previousInstallment) {
          const id = previousInstallment._id

          if (id) {
            installment._id = id
          }
        }

        return installment
      })

      const installmentsWithCorrectLateStatuses =
        installmentsWithPreviousIds.map(installment => {
          if (
            moment(installment.due)
              .tz(timezone)
              .isBefore(moment().tz(timezone), 'day') &&
            (!installment.realization ||
              installment.realization < installment.target)
          ) {
            installment.status = 'late'
            installment.wasLate = true

            if (!installment.realization) {
              installment.realization = 0
            }
          }

          return installment
        })

      changes['installments'] = installmentsWithCorrectLateStatuses

      const status = installments.some(
        installment => installment.status === 'late' && installment.target !== 0
      )
        ? 'active'
        : disbursedAmount <= realizedAmount
        ? 'repaid'
        : 'active'

      changes['status'] = status
    }

    const { _id: parentId } = await eventProcessor.addEvent({
      type: 'update',
      obj: 'loan',
      objId: loan._id,
      payload: changes,
      meta,
      transactionName: 'EDIT_LOAN',
    })

    if (changes.approvedAmount || changes.cashCollateral || changes.cycle) {
      const securityBalanceBeforeEditingLoan = client.securityBalance || 0

      const securityBalanceAfterEditingLoan =
        (changes.approvedAmount || loan.approvedAmount) *
        ((changes.cashCollateral || loan.cashCollateral) / 100)

      const securityBalanceDiff =
        securityBalanceAfterEditingLoan - securityBalanceBeforeEditingLoan

      await eventProcessor.addEvent({
        type: 'update',
        obj: 'client',
        objId: client._id,
        payload: {
          securityBalance: securityBalanceAfterEditingLoan,
        },
        meta,
        parentId,
        transactionName: 'EDIT_LOAN',
      })

      await eventProcessor.addEvent({
        type: 'create',
        obj: 'securityTransaction',
        payload: {
          date: moment(disbursementDate).tz(timezone).toDate(),
          loanId: loan._id,
          branchId: loan.branchId,
          clientId: loan.clientId,
          comment: 'Loan disbursement',
          openingSecurityBalance: securityBalanceBeforeEditingLoan,
          closingSecurityBalance: securityBalanceAfterEditingLoan,
          change: securityBalanceDiff,
        },
        meta,
        parentId,
        transactionName: 'EDIT_LOAN',
      })
    }

    if (cashAtHand) {
      const cashAtHandForms = await dataSources.cashAtHandForms.collection
        .find({
          branchId: loan.branchId,
          dateIso: {
            $gt: moment(cashAtHand).tz(timezone).startOf('day').toDate(),
          },
        })
        .toArray()

      if (cashAtHandForms.length > 0) {
        await Promise.all(
          cashAtHandForms.map(form =>
            eventProcessor.addEvent({
              type: 'update',
              obj: 'cashAtHandForm',
              objId: form._id,
              payload: {
                closed: false,
                unlockReason: 'Modification of loan ' + loan._id,
              },
              parentId,
              transactionName: 'EDIT_LOAN',
            })
          )
        )
      }
    }

    if (disbursement) {
      const loanDisbursementRelatedSecurityTransaction =
        await dataSources.securityBalances.collection.findOne({
          loanId: loan._id,
        })

      await eventProcessor.addEvent({
        type: 'update',
        obj: 'securityTransaction',
        objId: loanDisbursementRelatedSecurityTransaction._id,
        payload: {
          date: moment(disbursement).tz(timezone).toDate(),
        },
        parentId,
        transactionName: 'EDIT_LOAN',
      })
    }
  }

  return true
}

module.exports = updateLoan
