const _ = require('lodash')
const fs = require('fs')
const lodash = require('lodash')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')

const { getDatabaseConnection, disconnect } = require('../client')
const { BSON } = require('realm')

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

  const users = await db.collection('users').find().toArray()

  const micah = users.find(user => user.fullPhoneNumber === '+256772711125')

  const joel = users.find(user => user.fullPhoneNumber === '+256777249610')

  await db
    .collection('users')
    .updateOne({ _id: micah._id }, { $set: { role: 'loanOfficer' } })

  await db
    .collection('users')
    .updateOne({ _id: joel._id }, { $set: { role: 'loanOfficer' } })

  let events = []

  events.push({
    _id: new BSON.ObjectId(),
    type: 'update',
    obj: 'user',
    objId: micah._id,
    payload: {
      role: 'loanOfficer',
    },
    timestamp: new Date(),
    migration: 'migrations/1649335095379-fix-kasese-1-loan-officer-roles.js',
  })

  events.push({
    _id: new BSON.ObjectId(),
    type: 'update',
    obj: 'user',
    objId: joel._id,
    payload: {
      role: 'loanOfficer',
    },
    timestamp: new Date(),
    migration: 'migrations/1649335095379-fix-kasese-1-loan-officer-roles.js',
  })

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
        db.collection('clientGroups').updateOne(
          { _id: event.objId },
          {
            $set: {
              ...lodash.omit(event.payload, ['_id', 'createdAt']),
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
