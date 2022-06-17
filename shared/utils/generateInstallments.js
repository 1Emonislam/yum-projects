import { generateDueDates } from './generateDueDates'
import { ObjectId } from 'bson'
import moment from 'moment-timezone'
import { timezone } from '../constants'

const generateInstallmentTarget = ({
  principal,
  interestRate,
  durationValue,
  floorTo,
  overrideTarget,
}) => {
  if (overrideTarget) {
    return overrideTarget
  }

  const amountToRepay = Math.round(
    Number(principal) + Number(principal) * interestRate
  )

  const initialInstallment = Math.round(amountToRepay / Number(durationValue))

  let installment

  const initialInstallmentDivided = Number(initialInstallment) / Number(floorTo)

  if (Number.isInteger(initialInstallmentDivided)) {
    installment = initialInstallment
  } else {
    installment = Math.ceil(initialInstallmentDivided) * Number(floorTo)
  }

  return installment
}

export const generateInstallments = ({
  principal,
  interestRateInPercents,
  startDate,
  duration,
  overrideTarget,
  floorTo = 500,
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

  const installment = generateInstallmentTarget({
    principal,
    interestRate,
    durationValue,
    floorTo,
    overrideTarget,
  })

  let principalOutstandingClosingBalance = Number(principal)

  let interestOutstandingClosingBalance = Math.round(
    Number(principal) * interestRate
  )

  const dueDates = generateDueDates({
    initialDueDate: moment(startDate).tz(timezone).endOf('day'),
    numberOfDueDates: durationValue,
    frequencyOfDueDates: durationUnit,
    holidays: holidays,
    futureOnly: false,
  })

  const installments = dueDates.map((due, i) => {
    const principalOutstandingOpeningBalance =
      principalOutstandingClosingBalance

    const isTheFirstInstallment = i === 0

    const isTheLastInstallment = i === Number(durationValue) - 1

    const interestPart = isTheLastInstallment
      ? interestOutstandingClosingBalance
      : Math.round((Number(principal) * interestRate) / Number(durationValue))

    const principalPart = isTheLastInstallment
      ? principalOutstandingClosingBalance
      : installment - interestPart

    principalOutstandingClosingBalance -= principalPart
    interestOutstandingClosingBalance -= interestPart

    return {
      _id: new ObjectId(),
      due: toDate ? due.toDate() : due.format(),
      principalOutstandingOpeningBalance,
      principalRepayment: principalPart,
      interest: interestPart,
      total: isTheLastInstallment ? principalPart + interestPart : installment,
      principalOutstandingClosingBalance,
      target: isTheLastInstallment ? principalPart + interestPart : installment,
      openingBalance: isTheFirstInstallment
        ? principalOutstandingOpeningBalance
        : null,
      realization: null,
      status: 'future',
      wasLate: false,
    }
  })

  return installments
}
