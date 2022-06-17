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

  const clients = await db
    .collection('clients')
    .find({
      clientGroupId: { $exists: false },
    })
    .toArray()

  let events = []

  for (let [index, client] of clients.entries()) {
    console.log(`Client ${index + 1}/${clients.length} (${client._id})…`)

    events.push({
      _id: new ObjectId(),
      type: 'delete',
      obj: 'client',
      objId: client._id,
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
    console.log('Deleting…')

    await db.collection('events').insertMany(events)

    await db.collection('clients').deleteMany({
      _id: { $in: events.map(event => event.objId) },
    })
  }

  await disconnect()
}

main()
