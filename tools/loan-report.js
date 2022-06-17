const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const ExcelJS = require('exceljs')
const moment = require('moment-timezone')
const { getDatabaseConnection, disconnect } = require('./client')
const axios = require('axios')
const _ = require('lodash')
const BSON = require('bson')
const argv = yargs(hideBin(process.argv)).argv
const timezone = 'Africa/Kampala'

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
    throw new Error('Specify principal'
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
      _id: new BSON.ObjectId(),
      due: toDate ? due.toDate() : due.format(),
      principalOutstandingOpeningBalance,
      principalRepayment: principalPart,
      interest: interestPart,
      cumulativeInterest,
      realInsurance: insurancePart,
      cumulativeInsurance,
      principalOutstandingClosingBalance,
      target: isTheLastInstallment ? principalPart + interestPart : installment,
      realization: null,
      status: 'future',
      wasLate: false,
    }
  })

  return installments
}

async function main() {
  if (!argv.env) {
    console.log()
    console.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  console.log('Generating…')

  const db = await getDatabaseConnection(argv.env)

  const loansCol = db.collection('loans')
  const clientsCol = db.collection('clients')
  const groupsCol = db.collection('clientGroups')
  const usersCol = db.collection('users')

  const loans = await loansCol.find({ status: 'active' }).toArray()

  const clients = await clientsCol
    .find({
      _id: { $in: loans.map(loan => loan.clientId) },
    })
    .toArray()

  const groups = await groupsCol
    .find({
      _id: { $in: loans.map(loan => loan.clientGroupId) },
    })
    .toArray()

  const users = await usersCol
    .find({
      _id: { $in: loans.map(loan => loan.loanOfficerId) },
    })
    .toArray()

  const rows = []

  const daysMap = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday',
  }

  const workbook = new ExcelJS.Workbook()

  workbook.calcProperties.fullCalcOnLoad = true

  const worksheet = workbook.addWorksheet('Loan Report')

  worksheet.columns = [
    { header: 'Id', key: 'id', width: 5 },
    {
      header: 'Yam',
      key: 'link',
      width: 5,
    },
    { header: 'Branch Name', key: 'branchName', width: 12 },
    {
      header: 'Loan Officer Name',
      key: 'loanOfficerName',
      width: 22,
    },
    {
      header: 'Group Name',
      key: 'groupName',
      width: 22,
    },
    {
      header: 'Meeting Frequency',
      key: 'meetingFrequency',
      width: 15,
    },
    {
      header: 'Meeting Day',
      key: 'meetingDay',
      width: 10,
    },
    {
      header: 'Member Full Name',
      key: 'memberFullName',
      width: 26,
    },
    {
      header: 'Detailed Address',
      key: 'detailedAddress',
      width: 82,
    },
    {
      header: 'Group meeting time',
      key: 'groupMeetingTime',
      width: 16,
    },
    {
      header: 'Group meeting address',
      key: 'groupMeetingAddress',
      width: 88,
    },
    {
      header: 'Loan officer phone number',
      key: 'loanOfficerPhoneNumber',
      width: 21,
    },
    // {
    //   header: 'Client passbook identifier',
    //   key: 'clientPassbookIdentifier',
    //   width: 32,
    // },
    {
      header: 'Chairperson, secretary, cashier',
      key: 'role',
      width: 24,
    },
    {
      header: 'Loan cycle',
      key: 'loanCycle',
      width: 15,
    },
    {
      header: 'Member Admission Date',
      key: 'memberAdmissionDate',
      width: 20,
    },
    {
      header: 'Security Balance',
      key: 'securityBalance',
      width: 14,
    },
    {
      header: 'Loan Product Name',
      key: 'loanProductName',
      width: 20,
    },
    {
      header: 'Principal Amount',
      key: 'principalAmount',
      width: 15,
    },
    {
      header: 'Amortized Principal Realized Amount',
      key: 'amortizedPrincipalRealizedAmount',
      width: 30,
    },
    {
      header: 'Interest Amount',
      key: 'interestAmount',
      width: 14,
    },
    {
      header: 'Amortized Interest Realized Amount',
      key: 'amortizedInterestRealizedAmount',
      width: 30,
    },
    {
      header: 'Interest Rate (%)',
      key: 'interestRate',
      width: 14,
    },
    {
      header: 'Disbursed Amount',
      key: 'disbursedAmount',
      width: 15,
    },
    {
      header: 'Total Number Installment',
      key: 'totalNumberInstallment',
      width: 20,
    },
    {
      header: 'Installment Amount',
      key: 'installmentAmount',
      width: 16,
    },
    {
      header: 'Last Installment Amount',
      key: 'lastInstallmentAmount',
      width: 20,
    },
    {
      header: 'Outstanding Amount',
      key: 'outstandingAmount',
      width: 17,
    },
    {
      header: 'Expected Outstanding Amount',
      key: 'expectedOutstandingAmount',
      width: 24,
    },
    {
      header: 'Overdue Amount',
      key: 'overdue',
      width: 17,
    },
    {
      header: 'Overdue Age (Days)',
      key: 'overdueAge',
      width: 17,
    },

    {
      header: 'Overdue Age Category',
      key: 'overdueAgeCategory',
      width: 20,
    },
  ]

  for (let [index, loan] of loans.entries()) {
    const client = clients.find(
      client => client._id.toString() === loan.clientId.toString()
    )

    if (!client) {
      console.log('Potentially missing client:', loan.clientId.toString())
    }

    const group = groups.find(
      group => group._id.toString() === loan.clientGroupId.toString()
    )

    let role = 'Member'

    if (group) {
      if (String(group.presidentId) === String(client._id)) {
        role = 'President'
      }

      if (String(group.secretaryId) === String(client._id)) {
        role = 'Secretary'
      }

      if (String(group.cashierId) === String(client._id)) {
        role = 'Cashier'
      }
    } else {
      console.log(
        'Potentially missing client group:',
        loan.clientGroupId.toString()
      )
    }

    const loanOfficer = users.find(
      user => user._id.toString() === loan.loanOfficerId.toString()
    )

    const disbursedAmount = Math.round(
      loan.approvedAmount * (1 + loan.interestRate / 100)
    )

    const interestAmount = Math.round(
      loan.approvedAmount * (loan.interestRate / 100)
    )

    let cumulativeRealization = loan.installments.reduce(
      (acc, installment = {}) => {
        const { realization = 0, total, target } = installment

        // return acc + realization + (total - target)

        // TODO: Replace the line below with the line above
        // after the 1627468590-fix-NaN-realizations.js migration
        // (branch: migration-fix-NaN-realizations)

        return acc + (isNaN(realization) ? 0 : realization) + (total - target)
      },
      0
    )

    const outstandingAmount = disbursedAmount - cumulativeRealization

    let expectedRealization = loan.installments.reduce(
      (acc2, installment = {}) => {
        const { due, total, target } = installment

        if (moment(due).tz(timezone).isAfter(moment(), 'day')) {
          return acc2
        }

        return acc2 + target + (total - target)
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

    // Amortized Principal Realized Amount

    for (let i = 0; i < installments.length; i++) {
      let installment = installments[i]

      const { principalRepayment, realization, target } = installment

      if (realization) {
        if (realization === target) {
          installment.principalRepaymentRealization = principalRepayment
        } else if (realization < target) {
          const principalRatio = (realization * 100) / target / 100

          installment.principalRepaymentRealization = Math.ceil(
            principalRepayment * principalRatio
          )
        }
      }
    }

    const amortizedPrincipalRealizedAmount = installments.reduce(
      (acc, installment = {}) => {
        const { principalRepaymentRealization = 0 } = installment

        return acc + principalRepaymentRealization
      },
      0
    )

    // Amortized Interest Realized Amount

    for (let i = 0; i < installments.length; i++) {
      let installment = installments[i]

      const { interest, realization, target } = installment

      if (realization) {
        if (realization === target) {
          installment.interestRealization = interest
        } else if (realization < target) {
          const interestRatio = (realization * 100) / target / 100

          installment.interestRealization = Math.ceil(interest * interestRatio)
        }
      }
    }

    const amortizedInterestRealizedAmount = installments.reduce(
      (acc, installment = {}) => {
        const { interestRealization = 0 } = installment

        return acc + interestRealization
      },
      0
    )

    // Expected Outstanding Amount

    const expectedOutstandingAmount = disbursedAmount - expectedRealization

    // Overdue

    const overdue = outstandingAmount - expectedOutstandingAmount

    // Overdue Age

    let overdueAge

    if (overdue > 0) {
      const firstLateInstallmentDueDate = loan.installments.find(
        installment => installment.status === 'late'
      )

      if (firstLateInstallmentDueDate) {
        overdueAge = moment()
          .tz(timezone)
          .diff(moment(firstLateInstallmentDueDate.due).tz(timezone), 'days')
      } else {
        overdueAge = 'Error'
      }
    }

    // Overdue Age Category

    let overdueAgeCategory = 'No overdue'

    if (overdueAge > 365) {
      overdueAgeCategory = '>365'
    } else if (overdueAge > 180) {
      overdueAgeCategory = '181–365'
    } else if (overdueAge > 90) {
      overdueAgeCategory = '91–180'
    } else if (overdueAge > 30) {
      overdueAgeCategory = '31–90'
    } else if (overdueAge > 0) {
      overdueAgeCategory = '1–30'
    }

    // Worksheet

    if (client && client.status !== 'inactive') {
      worksheet.addRow({
        id: index + 1,
        branchName: loan.branchName,
        loanOfficerName: loan.loanOfficerName,
        loanProductName: loan.loanProductName,
        groupName: loan.clientGroupName,
        meetingDay: daysMap[group.meeting.dayOfWeek],
        meetingFrequency: _.capitalize(group.meeting.frequency),
        memberFullName: `${client.lastName}, ${client.firstName}`,
        detailedAddress: client.admission.address,
        groupMeetingTime: group.meeting.time,
        groupMeetingAddress: group.meeting.address,
        loanOfficerPhoneNumber: loanOfficer.fullPhoneNumber,
        // clientPassbookIdentifier: client.passbookIdentifier,
        role: role,
        loanCycle: isNaN(loan.cycle) ? 'Wrong input data' : loan.cycle, // TODO: Feedback on the language?
        memberAdmissionDate: moment(client.admissionAt).format('DD/MM/YYYY'),
        securityBalance: client.securityBalance,
        principalAmount: loan.approvedAmount,
        amortizedPrincipalRealizedAmount,
        interestAmount,
        amortizedInterestRealizedAmount,
        interestRate: loan.interestRate,
        disbursedAmount,
        totalNumberInstallment: loan.duration.value,
        installmentAmount: loan.installments[0].target,
        lastInstallmentAmount:
          loan.installments[loan.installments.length - 1].target,
        outstandingAmount,
        expectedOutstandingAmount: expectedOutstandingAmount,
        overdue,
        overdueAge,
        overdueAgeCategory: overdueAgeCategory,
        link: {
          text: 'Open',
          hyperlink: `https://app.yamafrica.com/clients/${client._id}/loans/${loan._id}`,
        },
      })
    }
  }

  // const filename = [
  //   'loan-report-',
  //   moment().tz(timezone).format('YYYY-MM-DD-HH.mm'),
  //   '.xlsx',
  // ].join('')

  // const filetype =
  //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  // const s3 = await axios.post(
  //   'https://yx5s3grx2k.execute-api.us-east-1.amazonaws.com/dev/yamdev-upload',
  //   {
  //     filename,
  //     filetype,
  //     type: 'reports-loan',
  //   }
  // )

  // const { signedUrl: url, previewUrl: reportUrl } = s3.data

  // const buffer = await workbook.xlsx.writeBuffer()

  // await axios.put(url, buffer)

  // console.log('reportUrl:', reportUrl)

  await workbook.xlsx.writeFile('loan-report.xlsx')

  await disconnect()
}

main()
