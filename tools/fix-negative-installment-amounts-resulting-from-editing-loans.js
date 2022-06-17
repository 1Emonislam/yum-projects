const _ = require('lodash')
const { generateInstallments } = require('shared/utils/index.js')
const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const fs = require('fs')
const moment = require('moment-timezone')
const path = require('path')
const yargs = require('yargs/yargs')
import { timezone } from 'shared/constants'

const timestamp = new Date()

const migration = path.parse(__filename).name

const { getDatabaseConnection, disconnect } = require('./client')

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

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
      'installments.total': { $lt: 0 },
    })
    .toArray()

  const holidays = await db.collection('holidays').find().toArray()

  let events = []

  for (let [index, loan] of loans.entries()) {
    console.log('')
    console.log(
      `${index + 1}. https://app.yamafrica.com/clients/${loan.clientId}/loans/${
        loan._id
      } ${loan.edited ? 'Edited' : ''}`
    )

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

    const updates = events.filter(event => event.type === 'update')

    if (updates.length > 0) {
      await Promise.all(
        events.map(event =>
          db.collection(event.obj + 's').updateOne(
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

    console.log('')
  }

  await disconnect()
}

main()
