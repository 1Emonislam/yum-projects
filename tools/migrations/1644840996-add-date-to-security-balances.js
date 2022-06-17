const _ = require('lodash')
const { getDatabaseConnection, disconnect } = require('./../client')
const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const fs = require('fs')
const yargs = require('yargs/yargs')
const moment = require('moment-timezone')

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

const timestamp = new Date()

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const securityBalances = await db
    .collection('securityBalances')
    .find()
    .toArray()

  let events = []

  for (let [index, securityBalance] of securityBalances.entries()) {
    console.log(
      `Security balance ${index + 1}/${securityBalances.length} (${
        securityBalance._id
      })…`
    )

    events.push({
      _id: new ObjectId(),
      type: 'update',
      obj: 'securityTransaction',
      objId: securityBalance._id,
      payload: {
        date: moment(securityBalance.createdAt).tz('Africa/Kampala').toDate(),
      },
      timestamp,
      migration: '1644840996-add-date-to-security-balances.js',
    })
  }

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Log

  // fs.writeFile(
  //   './1644840996-add-date-to-security-balances.json',
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
        db.collection('securityBalances').updateOne(
          { _id: event.objId },
          {
            $set: {
              ..._.omit(event.payload, ['_id', 'createdAt']),
              updatedAt: event.timestamp,
            },
          },
          { upsert: false }
        )
      )
    )

    console.log('')
  }

  await disconnect()
}

main()
