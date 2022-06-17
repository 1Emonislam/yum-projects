const _ = require('lodash')
const { getDatabaseConnection, disconnect } = require('./../client')
const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const yargs = require('yargs/yargs')

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

const timestamp = new Date()

const migration = '1648554607441-create-area-and-regional-managers.js'

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  // sample branchIds
  // Ntida -> 61150f296c988e63d9f9ca65
  // Kasangati -> 622fb84fabfbb4c97ed36456
  // Nakulabye -> 6228cc66773d9755089bdb2a

  // FIXME: Area & regional managers don't need branchId field
  const areaManagerPayload = {
    firstName: 'AM-Lewis',
    lastName: 'demo',
    fullPhoneNumber: '+2561198',
    role: 'areaManager',
    branchId: new ObjectId('61150f296c988e63d9f9ca65'),
    branchIds: [
      new ObjectId('61150f296c988e63d9f9ca65'),
      new ObjectId('622fb84fabfbb4c97ed36456'),
    ],
  }
  await db.collection('users').insertOne(areaManagerPayload)

  const regionalManagerPayload = {
    firstName: 'RM-Hamilton',
    lastName: 'demo',
    fullPhoneNumber: '+2561199',
    role: 'regionalManager',
    branchId: new ObjectId('6228cc66773d9755089bdb2a'),
    branchIds: [
      new ObjectId('61150f296c988e63d9f9ca65'),
      new ObjectId('622fb84fabfbb4c97ed36456'),
      new ObjectId('6228cc66773d9755089bdb2a'),
    ],
  }
  await db.collection('users').insertOne(regionalManagerPayload)

  const events = []

  // demo area manager
  events.push({
    _id: new ObjectId(),
    type: 'create',
    obj: 'user',
    payload: areaManagerPayload,
    timestamp,
    migration,
  })

  // demo regional manager
  events.push({
    _id: new ObjectId(),
    type: 'create',
    obj: 'user',
    payload: regionalManagerPayload,
    timestamp,
    migration,
  })

  console.log('')
  console.log(events.length, 'events to send to MongoDB')
  console.log('')

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
