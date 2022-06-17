const { ObjectId } = require('mongodb')
const moment = require('moment-timezone')

const timezone = process.env.TIMEZONE

const amortization = async (_, { input: loanId }, { dataSources }) => {
  const generateDueDates = ({
    initialDueDate,
    numberOfDueDates,
    frequencyOfDueDates,
  }) => {
    const due = moment(initialDueDate).tz(timezone).endOf('day').milliseconds(0)

    const isoWeekday = moment(initialDueDate).tz(timezone).isoWeekday()

    let dueDates = []

    while (dueDates.length < numberOfDueDates) {
      const dueClone = due.clone()

      dueDates.push(dueClone)

      switch (frequencyOfDueDates) {
        case 'month':
          due
            .add(5, 'week')
            .startOf('month')
            .isoWeekday(isoWeekday)
            .endOf('day')
            .milliseconds(0)

          if (due.month() === dueClone.month()) {
            due.add(1, 'week')
          }

          break
        case 'twoWeeks':
          due.add(2, 'week')
          break
        default:
          due.add(1, 'week')
      }
    }

    return dueDates
  }

  const generateInstallmentTarget = ({
    principal,
    interestRate,
    durationValue,
    overrideTarget,
  }) => {
    if (overrideTarget) {
      return overrideTarget
    }

    const amountToRepay = Math.round(
      Number(principal) + Number(principal) * interestRate
    )

    const installment = Math.round(amountToRepay / Number(durationValue))

    return installment
  }

  const generateInstallments = ({
    principal,
    interestRateInPercents,
    insuranceRateInPercents,
    startDate,
    duration,
    overrideTarget,
    toDate = false,
    holidays,
  }) => {
    if (!principal) {
      throw new Error('Specify principal')
    }

    if (!interestRateInPercents) {
      throw new Error('Specify interestRateInPercents')
    }

    if (!startDate) {
      throw new Error('Specify startDate')
    }

    if (!duration) {
      throw new Error('Specify duration')
    }

    const { value: durationValue, unit: durationUnit } = duration

    if (!durationUnit) {
      throw new Error('Specify duration unit')
    }

    if (!durationValue) {
      throw new Error('Specify duration value')
    }

    if (!holidays || !Array.isArray(holidays)) {
      throw new Error('Specify holidays array')
    }

    const interestRate = Number(interestRateInPercents) / 100
    const insuranceRate = Number(insuranceRateInPercents) / 100

    const installment = generateInstallmentTarget({
      principal,
      interestRate,
      durationValue,
      overrideTarget,
    })

    let principalOutstandingClosingBalance = Number(principal)

    const dueDates = generateDueDates({
      initialDueDate: moment(startDate).tz(timezone).endOf('day'),
      numberOfDueDates: durationValue,
      frequencyOfDueDates: durationUnit,
      holidays: holidays,
      futureOnly: false,
    })

    let parts = 0

    dueDates.forEach((_, i) => {
      const add = i + 1

      parts = parts + add
    })

    const interest = principal * (interestRateInPercents / 100)
    const insurance = principal * (insuranceRateInPercents / 100)

    const singleInterestPart = interest / parts
    const singleInsurancePart = insurance / parts

    let cumulativeInterest = 0
    let cumulativeInsurance = 0

    const installments = dueDates.map((due, i) => {
      const principalOutstandingOpeningBalance =
        principalOutstandingClosingBalance

      const isTheLastInstallment = i === Number(durationValue) - 1

      const interestPart = isTheLastInstallment
        ? interest - cumulativeInterest
        : Math.round((durationValue - i) * singleInterestPart)

      const insurancePart = isTheLastInstallment
        ? insurance - cumulativeInsurance
        : Math.round((durationValue - i) * singleInsurancePart)

      cumulativeInterest += interestPart
      cumulativeInsurance += insurancePart

      const principalPart = isTheLastInstallment
        ? principalOutstandingClosingBalance
        : installment - interestPart

      principalOutstandingClosingBalance -= principalPart

      return {
        _id: ObjectId(),
        due: toDate ? due.toDate() : due.format(),
        principalOutstandingOpeningBalance,
        principalRepayment: principalPart,
        interest: interestPart,
        cumulativeInterest,
        realInsurance: insurancePart,
        cumulativeInsurance,
        principalOutstandingClosingBalance,
        target: isTheLastInstallment
          ? principalPart + interestPart
          : installment,
        realization: null,
        status: 'future',
        wasLate: false,
      }
    })

    return installments
  }

  const loan = await dataSources.loans.collection.findOne({
    _id: ObjectId(loanId),
  })

  if (loan) {
    const interestAmount = loan.approvedAmount * (loan.interestRate / 100)

    const insuranceAmount = loan.approvedAmount * (loan.loanInsurance / 100)

    let cumulativeRealization = loan.installments.reduce(
      (acc, installment = {}) => {
        const { realization = 0, total, target } = installment
        return acc + realization + (total - target)
      },
      0
    )

    const guessedInstallmentTarget = loan.installments[0].total

    const principal = loan.approvedAmount || loan.requestedAmount

    const installments = generateInstallments({
      principal,
      duration: loan.duration,
      interestRateInPercents: loan.interestRate,
      insuranceRateInPercents: loan.loanInsurance,
      startDate: loan.installments[0].due,
      holidays: [],
      overrideTarget: guessedInstallmentTarget,
    })

    // Realization and status

    for (let i = 0; i < installments.length; i++) {
      let installment = installments[i]

      if (cumulativeRealization >= installment.target) {
        installment.status = 'paid'
        installment.realization = installment.target
        cumulativeRealization -= installment.target
      } else {
        if (cumulativeRealization > 0) {
          installment.status = 'late'
          installment.wasLate = true
          installment.realization = cumulativeRealization
          cumulativeRealization = 0
        }
      }
    }

    // Interest receivable

    let interestReceivable = JSON.parse(JSON.stringify(interestAmount))

    for (let i = 0; i < installments.length; i++) {
      let installment = installments[i]

      interestReceivable -= installment.interest

      installment.interestReceivable = interestReceivable
    }

    // Monthly accrued interest

    for (let i = 0; i < installments.length; i++) {
      let installment = installments[i]

      const month = moment(installment.due).tz(timezone).format('MM.YYYY')

      installment.monthlyAccruedInterest = Math.floor(
        installments
          .filter(i => moment(i.due).tz(timezone).format('MM.YYYY') === month)
          .reduce((acc, installment = {}) => {
            const { interest } = installment

            return acc + interest
          }, 0)
      )
    }

    // Monthly accrued interest realization and unearned interest

    let interestUnearned = JSON.parse(JSON.stringify(interestAmount))

    let interestUnearnedAccountedMonths = []

    for (let i = 0; i < installments.length; i++) {
      let installment = installments[i]

      const month = moment(installment.due).tz(timezone).format('MM.YYYY')

      installment.monthlyAccruedInterestRealization = Math.floor(
        installments
          .filter(i => moment(i.due).tz(timezone).format('MM.YYYY') === month)
          .reduce((acc, installment = {}) => {
            const { interest, realization, target } = installment

            let interestAmount = 0

            if (realization) {
              if (realization === target) {
                interestAmount = interest
              } else if (realization < target) {
                const interestRatio = (realization * 100) / target / 100

                interestAmount = interest * interestRatio
              }
            }

            return acc + interestAmount
          }, 0)
      )

      if (interestUnearnedAccountedMonths.includes(month)) {
        installment.interestUnearned = interestUnearned
      } else {
        installment.interestUnearned =
          interestUnearned - installment.monthlyAccruedInterestRealization

        interestUnearned -= installment.monthlyAccruedInterestRealization

        interestUnearnedAccountedMonths.push(month)
      }
    }

    // Monthly insurance

    const installmentsReversed = JSON.parse(
      JSON.stringify(installments)
    ).reverse()

    for (let i = 0; i < installments.length; i++) {
      let installment = installments[i]

      const { principalRepayment } = installmentsReversed[i]

      installment.insurance = Math.floor(principalRepayment * 0.01)
    }

    const insuranceAmountWithAmortization = installments.reduce(
      (all, installment) => all + installment.insurance,
      0
    )

    if (insuranceAmount !== insuranceAmountWithAmortization) {
      let difference = insuranceAmount - insuranceAmountWithAmortization // 12

      const differencePart = difference / installments.length

      const differencePartRounded = Math.ceil(differencePart)

      for (let i = 0; i < installments.length; i++) {
        if (difference > 0) {
          let installment = installments[i]

          installments[i].insurance =
            installment.insurance + differencePartRounded

          difference -= differencePartRounded
        } else {
          break
        }
      }
    }

    // Monthly insurance realization

    for (let i = 0; i < installments.length; i++) {
      let installment = installments[i]

      const { realization, target } = installment

      const { principalRepayment } = installmentsReversed[i]

      let insuranceRealizationAmount

      if (realization) {
        if (realization === target) {
          insuranceRealizationAmount = installment.insurance
        } else if (realization < target) {
          const principalRatio = (realization * 100) / target / 100

          insuranceRealizationAmount =
            installment.realInsurance * principalRatio
        }
      }

      if (insuranceRealizationAmount > 0) {
        installment.insuranceRealization = Math.floor(
          insuranceRealizationAmount
        )
      } else {
        installment.insuranceRealization = null
      }
    }

    // Monthly accrued insurance and insurance liability

    let insuranceLiability = JSON.parse(JSON.stringify(insuranceAmount))

    let insuranceLiabilityAccountedMonths = []

    for (let i = 0; i < installments.length; i++) {
      let installment = installments[i]

      const month = moment(installment.due).tz(timezone).format('MM.YYYY')

      installment.monthlyAccruedInsurance = Math.floor(
        installments
          .filter(i => moment(i.due).tz(timezone).format('MM.YYYY') === month)
          .reduce((acc, installment = {}) => {
            const { realInsurance } = installment

            return acc + realInsurance
          }, 0)
      )

      if (insuranceLiabilityAccountedMonths.includes(month)) {
        installment.insuranceLiability = insuranceLiability
      } else {
        installment.insuranceLiability =
          insuranceLiability - installment.monthlyAccruedInsurance

        insuranceLiability -= installment.monthlyAccruedInsurance

        insuranceLiabilityAccountedMonths.push(month)
      }
    }

    // Monthly accrued insurance realization

    for (let i = 0; i < installments.length; i++) {
      let installment = installments[i]

      const month = moment(installment.due).tz(timezone).format('MM.YYYY')

      installment.monthlyAccruedInsuranceRealization = Math.floor(
        installments
          .filter(i => moment(i.due).tz(timezone).format('MM.YYYY') === month)
          .reduce((acc, installment = {}) => {
            const { insuranceRealization } = installment

            return acc + insuranceRealization
          }, 0)
      )
    }

    // Round numbers

    for (let i = 0; i < installments.length; i++) {
      let installment = installments[i]

      if (installment.cumulativeInterest) {
        installment.cumulativeInterest = Math.ceil(
          installment.cumulativeInterest
        )
      }

      if (installment.cumulativeInsurance) {
        installment.cumulativeInsurance = Math.ceil(
          installment.cumulativeInsurance
        )
      }

      if (installment.insuranceLiability) {
        installment.insuranceLiability = Math.floor(
          installment.insuranceLiability
        )
      }

      if (installment.interest) {
        installment.interest = Math.ceil(installment.interest)
      }

      if (installment.interestReceivable) {
        installment.interestReceivable = Math.ceil(
          installment.interestReceivable
        )
      }

      if (installment.interestUnearned) {
        installment.interestUnearned = Math.ceil(installment.interestUnearned)
      }

      if (installment.realInsurance) {
        installment.realInsurance = Math.ceil(installment.realInsurance)
      }

      if (installment.target) {
        installment.target = Math.ceil(installment.target)
      }
    }

    return {
      installments,
    }
  }
}

module.exports = amortization
