const _ = require('lodash')
const { getDatabaseConnection, disconnect } = require('./../client')
const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const fs = require('fs')
const path = require('path')
const yargs = require('yargs/yargs')

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

  const eventsToOverwrite = await db
    .collection('events')
    .find({
      'payload.meeting.frequency': 'undefined',
      importNotes:
        'import-2022-02-22.csv; import-2022-02-22.csv; --date: 2022-02-22',
    })
    .toArray()

  let events = []

  for (let [index, event] of eventsToOverwrite.entries()) {
    console.log(
      `Event ${index + 1}/${eventsToOverwrite.length} (${event._id})…`
    )

    events.push({
      _id: new ObjectId(),
      type: 'update',
      obj: event.obj,
      objId: event._id,
      payload: {
        meeting: { ...event.payload.meeting, frequency: 'weekly' },
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

    console.log('')
  }

  await disconnect()
}

main()
