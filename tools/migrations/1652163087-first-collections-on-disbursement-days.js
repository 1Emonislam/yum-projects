const _ = require('lodash')
const { getDatabaseConnection, disconnect } = require('./../client')
const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const path = require('path')
const yargs = require('yargs/yargs')
const moment = require('moment-timezone')
const fs = require('fs')
const { generateDueDates } = require('./../../shared/utils/index.js')

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
    })
    .toArray()

  const holidays = await db.collection('holidays').find().toArray()

  let events = []

  for (let [index, loan] of loans.entries()) {
    console.log(`Loan ${index + 1}/${loans.length} (${loan._id})…`)

    const disbursement = moment(loan.disbursementAt).tz(timezone)

    const firstInstallment = moment(loan.installments[0].due).tz(timezone)

    if (firstInstallment.isSame(disbursement, 'day')) {
      const dueDates = generateDueDates({
        initialDueDate: firstInstallment.add(1, 'week'),
        numberOfDueDates: loan.installments.length,
        frequencyOfDueDates: 'week',
        futureOnly: false,
        holidays,
      })

      const installments = loan.installments.map((installment, i) => {
        installment.due = dueDates[i].toDate()

        return installment
      })

      events.push({
        _id: new ObjectId(),
        type: 'update',
        obj: 'loan',
        objId: loan._id,
        payload: {
          installments,
        },
        timestamp,
        migration,
      })
    }
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
