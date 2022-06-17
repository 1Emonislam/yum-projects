const moment = require('moment-timezone')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')
const { generateInstallments } = require('shared/utils/index.js')

const { getDatabaseConnection, disconnect } = require('./../client')
const { BSON } = require('realm')

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

const timezone = 'Africa/Kampala'

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const loans = await db
    .collection('loans')
    .find({
      installments: {
        $elemMatch: { due: new Date('2021-06-25T20:59:59.000+00:00') },
      },
    })
    .toArray()

  const holidays = await db.collection('holidays').find({}).toArray()

  let events = []

  for (let loan of loans) {
    console.log(
      `Loan ${loan.code}`,
      `https://app.yamafrica.com/clients/${String(
        loan.clientId
      )}/loans/${String(loan._id)}`
    )

    let totalRealization = loan.installments.reduce((acc, installment = {}) => {
      const { realization = 0, total, target } = installment
      return acc + realization + (total - target)
    }, 0)

    // console.log('Cumulative realization', totalRealization)

    const installments = generateInstallments({
      principal: loan.approvedAmount || loan.requestedAmount,
      durationInWeeks: loan.installments.length,
      interestRateInPercents: loan.interestRate,
      startDate: loan.installments[0].due,
      // floorTo: 500,
      overrideTarget: loan.installments[0].target,
      toDate: true,
      holidays,
    })

    const oldInstallments = JSON.parse(JSON.stringify(loan.installments))

    const installmentsBeforeToday = installments.filter(installment =>
      moment(installment.due)
        .tz(timezone)
        .isSameOrBefore(moment('2021-08-18T00:00:00.000Z'), 'day')
    )

    const futureInstallments = installments.slice(
      installmentsBeforeToday.length
    )

    for (let installment of installmentsBeforeToday) {
      if (installment.total <= totalRealization) {
        installment.realization = installment.total
        installment.target = installment.total
        installment.status = 'paid'
        totalRealization -= installment.total
      } else {
        if (totalRealization > 0) {
          installment.realization = totalRealization
          installment.target = installment.total
          totalRealization -= installment.total
        }
        installment.status = 'late'
        installment.wasLate = true
      }
    }

    for (let i = futureInstallments.length - 1; i >= 0; i--) {
      const installment = futureInstallments[i]
      if (installment.total <= totalRealization) {
        installment.target = 0
        totalRealization -= installment.total
      } else {
        if (totalRealization > 0) {
          installment.target = installment.total - totalRealization
          totalRealization -= installment.total
        }
      }
    }

    const table = []

    for (let i = 0; i < oldInstallments.length; i++) {
      table.push({
        'old due': moment(oldInstallments[i].due).format('YYYY-MM-DD'),
        'old total': oldInstallments[i].total,
        'old target': oldInstallments[i].target,
        'old realization': oldInstallments[i].realization || 0,
        'old status': oldInstallments[i].status,
        'new due': moment(installments[i].due).format('YYYY-MM-DD'),
        'new total': installments[i].total,
        'new target': installments[i].target,
        'new realization': installments[i].realization || 0,
        'new status': installments[i].status,
      })
    }

    // offset indexes to start from 1
    table.unshift({})
    delete table[0]

    console.table(table)
    console.log('')

    events.push({
      _id: new BSON.ObjectId(),
      type: 'update',
      obj: 'loan',
      objId: loan._id,
      payload: {
        installments,
      },
      timestamp: new Date(),
      migration: '1629104374-fix-missing-holiday-on-2021-06-25.js',
    })
  }

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Save to Mongo

  console.log('Inserting…')

  await db.collection('events').insertMany(events)

  console.log('')

  await disconnect()
}

main()
