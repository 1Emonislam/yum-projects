const _ = require('lodash')
const { getDatabaseConnection, disconnect } = require('./../client')
const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const path = require('path')
const yargs = require('yargs/yargs')
const moment = require('moment-timezone')

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

  const eventsWithLoanIds = await db
    .collection('events')
    .find(
      {
        migration: '1650275242-installment-due-dates',
      },
      {
        objId: 1,
      }
    )
    .toArray()

  // const eventsWithLoanIds = [
  //   {
  //     objId: ObjectId('6255155026b883169c7daad9'),
  //   },
  // ]

  const loans = await db
    .collection('loans')
    .find({
      _id: { $in: eventsWithLoanIds.map(event => event.objId) },
    })
    .toArray()

  // loans[0].installments.forEach(installment => {
  //   if (
  //     moment(installment.due).format('HH:mm') !== '21:59' &&
  //     moment(installment.due).format('HH:mm') !== '22:59'
  //   ) {
  //     console.log(
  //       '!',
  //       moment(installment.due).format('HH:mm'),
  //       installment.due,
  //       '->',
  //       moment(installment.due)
  //         .tz(timezone)
  //         .subtract(1, 'day')
  //         .endOf('day')
  //         .milliseconds(0)
  //         .toDate()
  //     )
  //   } else {
  //     console.log(moment(installment.due).format('HH:mm'), installment.due)
  //   }
  //   // if (moment(installment.due).format('HH:mm') !== '21:59') {
  //   //   installment.due = moment(installment.due)
  //   //     .tz(timezone)
  //   //     .endOf('day')
  //   //     .milliseconds(0)
  //   //     .toDate()
  //   // }
  // })

  // process.exit()

  let events = []

  for (let [index, loan] of loans.entries()) {
    console.log(`Loan ${index + 1}/${loans.length} (${loan._id})…`)

    events.push({
      _id: new ObjectId(),
      type: 'update',
      obj: 'loan',
      objId: loan._id,
      payload: {
        installments: loan.installments.map(installment => {
          if (moment(installment.due).format('HH:mm') !== '21:59') {
            installment.due = moment(installment.due)
              .tz(timezone)
              .subtract(1, 'day')
              .endOf('day')
              .milliseconds(0)
              .toDate()
          }

          return installment
        }),
      },
      timestamp,
      migration,
    })
  }

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

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
