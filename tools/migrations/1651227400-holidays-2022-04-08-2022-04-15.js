const _ = require('lodash')
const { generateInstallments } = require('./../../shared/utils/index.js')
const { getDatabaseConnection, disconnect } = require('./../client')
const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const fs = require('fs')
const moment = require('moment-timezone')
const path = require('path')
const yargs = require('yargs/yargs')

const timezone = 'Africa/Kampala'

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

const timestamp = new Date()

const migration = path.parse(__filename).name

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
      status: 'active',
      $or: [
        {
          'installments.due': moment('08.04.2022', 'DD.MM.YYYY')
            .tz(timezone)
            .endOf('day')
            .milliseconds(0)
            .toDate(),
        },
        {
          'installments.due': moment('15.04.2022', 'DD.MM.YYYY')
            .tz(timezone)
            .endOf('day')
            .milliseconds(0)
            .toDate(),
        },
      ],
    })
    .toArray()

  const holidays = await db.collection('holidays').find().toArray()

  console.log('Loans to fix:', loans.length)

  if (loans.length > 0) {
    console.log(' ')

    console.log(
      `   1. https://app.yamafrica.com/clients/${loans[0].clientId}/loans/${loans[0]._id}`
    )

    console.log(
      `${Math.floor(loans.length / 2)}. https://app.yamafrica.com/clients/${
        loans[Math.floor(loans.length / 2) - 1].clientId
      }/loans/${loans[Math.floor(loans.length / 2) - 1]._id}`
    )

    console.log(
      `${loans.length}. https://app.yamafrica.com/clients/${
        loans[loans.length - 1].clientId
      }/loans/${loans[loans.length - 1]._id}`
    )

    console.log(' ')
  }

  let events = []

  for (let [index, loan] of loans.entries()) {
    console.log(`Loan ${index + 1}/${loans.length} (${loan._id})…`)

    const installments = generateInstallments({
      principal: loan.approvedAmount,
      duration: loan.duration,
      toDate: true,
      interestRateInPercents: loan.interestRate,
      startDate: moment(loan.installments[0].due),
      holidays,
    })

    let totalRealization = loan.installments.reduce((acc, installment = {}) => {
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
        installment.status = 'paid'
        totalRealization -= installment.total
      } else {
        if (totalRealization > 0) {
          installment.target = parseInt(installment.total - totalRealization)
          totalRealization -= installment.total
        }
      }
    }

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

    const installmentsWithCorrectLateStatuses = installmentsWithPreviousIds.map(
      installment => {
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
      }
    )

    events.push({
      _id: new ObjectId(),
      type: 'update',
      obj: 'loan',
      objId: loan._id,
      payload: {
        installments: installmentsWithCorrectLateStatuses,
      },
      timestamp,
      migration,
    })
  }

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Log

  // fs.writeFile(
  //   './' + migration + '.json',
  //   JSON.stringify(events),
  //   'utf8',
  //   err => {
  //     if (err) {
  //       console.log(`Error writing file: ${err}`)
  //     }
  //   }
  // )

  // Save to Mongo

  if (events.length > 0) {
    console.log('Inserting…')

    await db.collection('events').insertMany(events)

    await Promise.all(
      events.map(event =>
        db
          .collection(event.obj.replace('Transaction', 'Balance') + 's')
          .updateOne(
            { _id: event.objId },
            {
              $set: {
                ..._.omit(event.payload, ['_id', 'createdAt']),
                updatedAt: event.timestamp,
              },
            }
          )
      )
    )
  }

  await disconnect()
}

main()
