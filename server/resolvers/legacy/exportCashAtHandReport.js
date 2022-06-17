const _ = require('lodash')
const axios = require('axios')
const moment = require('moment-timezone')
const XLSX = require('xlsx')
const getS3UploadPresignedUrl = require('../../services/getS3UploadPresignedUrl')

const timezone = process.env.TIMEZONE

const exportCashAtHandReport = async (__, { input }, { dataSources }) => {
  const format = 'DD.MM.YYYY'

  const rows = [
    // [Label, Path, Comments]
    ['Date', 'date', false],
    ['Status', 'closed', false],
    ['Opening cash at hand', 'openingBalance', false],
    ['Closing cash at hand', 'closingBalance', false],
    ['From the head office (cash)', 'receipts.fromHeadOffice', true],
    ['From other branches (cash)', 'receipts.fromOtherBranches', true],
    ['Bank withdrawal', 'receipts.bankWithdrawal', true],
    ['Other income', 'receipts.otherIncome', true],
    ['Loan–related funds received', 'receipts.loanRelatedFundsReceived', false],
    ['Loan disbursements', 'payments.loanDisbursements', false],
    ['Security withdrawals', 'payments.securityWithdrawals', false],
    ['To the head office (cash)', 'payments.toHeadOffice', true],
    ['To other branches (cash)', 'payments.toOtherBranches', true],
    ['Rent', 'payments.expenses.rent', true],
    [
      'Utilities (gas, electricity, water)',
      'payments.expenses.utilities',
      true,
    ],
    ['Staff transport', 'payments.expenses.staffTransport', true],
    ['Staff lunch', 'payments.expenses.staffLunch', true],
    ['Staff airtime', 'payments.expenses.staffAirtime', true],
    ['Office management', 'payments.expenses.officeManagement', true],
    ['Internet expenses', 'payments.expenses.internet', true],
    ['Insurance claim', 'payments.expenses.insuranceClaim', true],
    ['Rubbish collection', 'payments.expenses.rubbishCollection', true],
    ['Miscellaneous', 'payments.expenses.miscellaneous', true],
    ['Deposit to the bank', 'payments.bankDeposit', true],
  ]

  const getRange = (start, end) => {
    let startDate = moment(start, format).tz(timezone)
    let endDate = moment(end, format).tz(timezone)
    let diff = endDate.diff(startDate, 'days')
    let range = []

    for (let i = 0; i <= diff; i++) {
      range.push(moment(startDate).add(i, 'days'))
    }

    return range
  }

  const doesFallOnHoliday = (holidays, date, futureOnly = true) => {
    if (futureOnly && date.getTime() <= Date.now()) {
      return false
    }

    for (let i = 0; i < holidays.length; i++) {
      const holiday = holidays[i]

      if (holiday.yearly) {
        const currentYear = date.getFullYear()

        holiday.startAt.setFullYear(currentYear)
        holiday.endAt.setFullYear(
          holiday.shouldAddYearToEndAt ? currentYear + 1 : currentYear
        )
      }

      if (
        holiday.endAt.getTime() >= date.getTime() &&
        holiday.startAt.getTime() <= date.getTime()
      ) {
        return true
      }
    }

    return false
  }

  const generateReport = async ({
    days,
    branches,
    cashAtHandForms,
    holidays,
    firstCashAtHandReportDate,
  }) => {
    const longestLabelLength = rows
      .map(row => row[0])
      .reduce((a, b) => (a.length > b.length ? a : b)).length

    let sheets = []

    let openDays = {}

    let summary = rows.map(rowDefinition => {
      const label = rowDefinition[0]
      const path = rowDefinition[1]

      const values = days.map(day => {
        const date = day.format(format)

        if (path === 'date') {
          return date
        }

        if (path === 'closed') {
          return 'Closed'
        }

        return 0
      })

      return [label, ...values]
    })

    branches.forEach(branch => {
      const aoa = rows.map(row => {
        const label = row[0]
        const path = row[1]

        const values = days.map((day, dayIndex) => {
          const date = day.format(format)

          if (path === 'date') {
            return date
          }

          const form = cashAtHandForms.find(form => {
            return (
              String(form.branchId) === String(branch._id) &&
              moment(form.date, format).tz(timezone).isSame(day, 'day')
            )
          })

          if (form) {
            if (path === 'closed') {
              if (form[path] === true) {
                return 'Closed'
              }

              summary.find(row => row['0'] === 'Status')[dayIndex + 1] = 'Open'

              if (!Object.prototype.hasOwnProperty.call(openDays, date)) {
                openDays[date] = {}
              }

              openDays[date][branch._id] = true

              return 'Open'
            }

            if (openDays?.[date]?.[branch._id]) {
              return '—'
            }

            const cellValue = _.get(form, path)

            let summaryValue = summary.find(row => row['0'] === label)[
              dayIndex + 1
            ]

            summary.find(row => row['0'] === label)[dayIndex + 1] =
              summaryValue + cellValue

            return cellValue
          } else {
            if (path === 'closed') {
              if (!day.isBefore(moment(branch.initDate).tz(timezone), 'day')) {
                summary.find(row => row['0'] === 'Status')[dayIndex + 1] =
                  'Open'
              }

              if (day.isBefore(firstCashAtHandReportDate, 'day')) {
                summary.find(row => row['0'] === 'Status')[dayIndex + 1] =
                  'No data'

                return 'No data'
              }

              if (day.isBefore(moment(branch.initDate).tz(timezone), 'day')) {
                return 'No data'
              }

              if (day.isoWeekday() > 5) {
                summary.find(row => row['0'] === 'Status')[dayIndex + 1] =
                  'Weekend'

                return 'Weekend'
              }

              if (holidays.includes(date)) {
                summary.find(row => row['0'] === 'Status')[dayIndex + 1] =
                  'Holiday'

                return 'Holiday'
              }

              return 'Open'
            }

            return '—'
          }
        })

        return [label, ...values]
      })

      sheets.push({
        name: branch.name,
        aoa,
      })
    })

    sheets.unshift({
      name: 'Summary',
      aoa: summary,
    })

    const wb = XLSX.utils.book_new()

    sheets.forEach(sheet => {
      const ws = XLSX.utils.aoa_to_sheet(sheet.aoa)

      ws['!cols'] = [{ wch: longestLabelLength }]

      XLSX.utils.book_append_sheet(wb, ws, sheet.name)
    })

    return wb
  }

  const uploadReport = async (report, start, end) => {
    const excel = XLSX.write(report, {
      bookType: 'xlsx',
      bookSST: false,
      type: 'buffer',
    })

    const filename = ['cash-at-hand-', start, '-', end, '.xlsx'].join('')

    const filetype =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    const { signedUrl: url, previewUrl: reportUrl } =
      await getS3UploadPresignedUrl({ filename, filetype, type: 'reports/cah' })

    try {
      await axios.put(url, excel)
    } catch (e) {
      console.error(e)
    }

    return reportUrl
  }

  const { start, end } = input

  const days = getRange(start, end)

  const cashAtHandForms = await dataSources.cashAtHandForms.collection
    .find({
      closed: true,
      dateIso: {
        $gte: moment(start, format).startOf('day').toDate(),
        $lte: moment(end, format).endOf('day').toDate(),
      },
    })
    .toArray()

  const branches = await dataSources.branches.collection.find().toArray()

  let firstCashAtHandReportDate = moment(branches[0].initDate).tz(timezone)

  branches.forEach(branch => {
    const initDate = moment(branch.initDate).tz(timezone)

    if (initDate.isBefore(firstCashAtHandReportDate, 'day')) {
      firstCashAtHandReportDate = initDate
    }
  })

  const holidaysFromDatabase = await dataSources.holidays.collection
    .find({}, { startAt: 1, endAt: 1, yearly: 1 })
    .toArray()

  const holidaysFromDatabaseOptimized = holidaysFromDatabase.map(holiday => {
    holiday.startAt = moment(holiday.startAt).tz(timezone).toDate()
    holiday.endAt = moment(holiday.endAt).tz(timezone).toDate()

    holiday.shouldAddYearToEndAt =
      holiday.endAt.getFullYear() > holiday.startAt.getFullYear()

    return holiday
  })

  const holidays = days
    .filter(day =>
      doesFallOnHoliday(holidaysFromDatabaseOptimized, day.toDate(), false)
    )
    .map(day => day.format(format))

  const report = await generateReport({
    days,
    branches,
    cashAtHandForms,
    holidays,
    firstCashAtHandReportDate,
  })

  const url = await uploadReport(report, start, end)

  return { url }
}

module.exports = exportCashAtHandReport
