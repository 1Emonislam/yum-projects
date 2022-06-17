const _ = require('lodash')
const { getDatabaseConnection, disconnect } = require('./../client')
const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const path = require('path')
const yargs = require('yargs/yargs')

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

const timestamp = new Date()

const migration = path.parse(__filename).name

const meta = 'https://yamafrica.freshdesk.com/a/tickets/428'

const clientId = '624af0842215ffd334b424b5'

const targetSecurityBalance = 60000

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const client = await db.collection('clients').findOne({
    _id: ObjectId(clientId),
  })

  const loan = await db.collection('loans').findOne({
    _id: client.loans[0],
  })

  const securityTransaction = await db.collection('securityBalances').findOne({
    clientId: client._id,
  })

  let events = []

  // Security balance: Update client

  events.push({
    _id: ObjectId(),
    type: 'update',
    obj: 'client',
    objId: client._id,
    payload: {
      securityBalance: targetSecurityBalance,
    },
    timestamp,
    migration,
    meta,
  })

  // Security balance: Fix the loan

  events.push({
    _id: ObjectId(),
    type: 'update',
    obj: 'loan',
    objId: loan._id,
    payload: {
      cycle: 1,
      cashCollateral: 10,
    },
    timestamp,
    migration,
    meta,
  })

  // Security balance: Update transaction

  events.push({
    _id: ObjectId(),
    type: 'update',
    obj: 'securityTransaction',
    objId: securityTransaction._id,
    payload: {
      closingSecurityBalance: targetSecurityBalance,
      change: targetSecurityBalance,
    },
    timestamp,
    migration,
    meta,
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
