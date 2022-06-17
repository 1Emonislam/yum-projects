const _ = require('lodash')
const { generateInstallments } = require('./../shared/utils/index.js')
const { getDatabaseConnection, disconnect } = require('./client')
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

  if (!argv.branch) {
    console.log()
    interactive.error('Please specify --branch <name>')
    console.log()
    process.exit(1)
  }

  if (!argv.date) {
    console.log()
    interactive.error('Please specify --date <YYYY-MM-DD>')
    console.log()
    process.exit(1)
  }

  if (typeof argv.openingBalance === 'undefined') {
    console.log()
    interactive.error('Please specify --opening-balance <number>')
    console.log()
    process.exit(1)
  }

  const branchName = argv.branch

  const initDate = moment(argv.date, 'YYYY-MM-DD', true)
    .tz(timezone)
    .startOf('day')
    .add(1, 'hour')
    .milliseconds(0)

  const openingBalanceInput = String(argv.openingBalance).replace(/ /g, '')

  const initOpeningBalance = Number(openingBalanceInput)

  if (openingBalanceInput.includes('.') || openingBalanceInput.includes(',')) {
    console.log()
    interactive.error(
      'Please specify --opening-balance <number> without dots and commas'
    )
    console.log()
    process.exit(1)
  }

  if (!initDate.isValid()) {
    console.log()
    interactive.error('Please specify VALID --date <YYYY-MM-DD>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const branch = await db.collection('branches').findOne({
    name: branchName,
  })

  if (!branch) {
    console.log()
    interactive.error('Please specify EXISTING --branch <name>')
    console.log()
    process.exit(1)
  }

  const cashAtHandForms = await db
    .collection('cashAtHandForms')
    .find({ branchId: branch._id })
    .toArray()

  let events = []

  events.push({
    _id: new ObjectId(),
    type: 'update',
    obj: 'branch',
    objId: branch._id,
    payload: {
      initDate: initDate.toDate(),
      initOpeningBalance,
    },
    timestamp,
    migration,
  })

  cashAtHandForms.forEach(form => {
    events.push({
      _id: new ObjectId(),
      type: 'delete',
      obj: 'cashAtHandForm',
      objId: form._id,
      timestamp,
      migration,
    })
  })

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

    await db.collection('branches').updateOne(
      { _id: events[0].objId },
      {
        $set: {
          ..._.omit(events[0].payload, ['_id', 'createdAt']),
          updatedAt: timestamp,
        },
      }
    )

    await db.collection('cashAtHandForms').deleteMany({
      branchId: branch._id,
    })
  }

  await disconnect()
}

main()
