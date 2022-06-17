/**
 * Hashes user's (initial) passwords. If a user password is already set(hashed),
 * this migration is a no-op.
 */

const lodash = require('lodash')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')
const { BSON } = require('realm')
const bcrypt = require('bcrypt')

const argv = yargs(hideBin(process.argv)).argv
const interactive = new Signale({ interactive: true, scope: 'tools' })

const { getDatabaseConnection, disconnect } = require('../client')
const { passwords } = require('../temp-data/passwords')

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const users = await db.collection('users').find().toArray()

  let events = []
  let count = 0

  for (const user of users) {
    console.log(`User ${++count}/${users.length} (${user._id})…`)

    // we'll only process users who are in the passwords hashMap && do not have a
    // password already set
    if (passwords[user.fullPhoneNumber] && !user.password) {
      const passwordHash = await bcrypt.hash(
        passwords[user.fullPhoneNumber],
        10
      )

      events.push({
        _id: new BSON.ObjectId(),
        type: 'update',
        obj: 'user',
        objId: user._id,
        payload: {
          password: passwordHash,
        },
        timestamp: new Date(),
        migration: '1636567088-hash-user-initial-passwords',
      })
      continue
    }
    console.log(`User ${user._id} already has a password set. Skipping.`)
  }

  // Stats
  console.log('')
  console.log(events.length, 'events to send to MongoDB')
  console.log('')

  // Save to MongoDB
  if (events.length > 0) {
    console.log('Inserting…')

    await db.collection('events').insertMany(events)
    await Promise.all(
      events.map(event =>
        db.collection('users').updateOne(
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
