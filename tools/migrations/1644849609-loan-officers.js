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

const migration = '1644849609-loan-officers.js'

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const Matovu = await db.collection('users').findOne({
    lastName: 'Matovu',
    firstName: 'Tom',
  })

  const Ndagire = await db.collection('users').findOne({
    lastName: 'Ndagire',
    firstName: 'Racheal',
  })

  const Okoth = await db.collection('users').findOne({
    lastName: 'Okoth',
    firstName: 'Jonah',
  })

  let events = []

  /*
  
  https://yamafrica.freshdesk.com/a/tickets/113

  Matovu → Okoth
  Ndagire → Matovu
  Okoth → Ndagire
  
  */

  // Matovu → Okoth

  events.push({
    _id: new ObjectId(),
    type: 'update',
    obj: 'user',
    objId: Okoth._id,
    payload: {
      firstName: Matovu.firstName,
      lastName: Matovu.lastName,
      fullPhoneNumber: Matovu.fullPhoneNumber,
    },
    timestamp,
    migration,
  })

  // Ndagire → Matovu

  events.push({
    _id: new ObjectId(),
    type: 'update',
    obj: 'user',
    objId: Matovu._id,
    payload: {
      firstName: Ndagire.firstName,
      lastName: Ndagire.lastName,
      fullPhoneNumber: Ndagire.fullPhoneNumber,
    },
    timestamp,
    migration,
  })

  // Okoth → Ndagire

  events.push({
    _id: new ObjectId(),
    type: 'update',
    obj: 'user',
    objId: Ndagire._id,
    payload: {
      firstName: Okoth.firstName,
      lastName: Okoth.lastName,
      fullPhoneNumber: Okoth.fullPhoneNumber,
    },
    timestamp,
    migration,
  })

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Log

  // fs.writeFile(
  //   './1644849609-loan-officers.json',
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
        db.collection('users').updateOne(
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
