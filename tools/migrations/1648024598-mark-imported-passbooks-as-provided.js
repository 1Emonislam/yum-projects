const _ = require('lodash')
const { getDatabaseConnection, disconnect } = require('./../client')
const { hideBin } = require('yargs/helpers')
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

  const clientsToUpdate = await db
    .collection('clients')
    .find(
      {
        status: { $ne: 'inactive' },
        $or: [{ passbook: { $exists: false } }, { passbook: false }],
      },
      { projection: { _id: 1 } }
    )
    .toArray()

  const clientEvents = await db
    .collection('events')
    .find({
      type: 'create',
      obj: 'client',
      objId: { $in: clientsToUpdate.map(client => client._id) },
      importId: { $exists: true },
    })
    .toArray()

  if (clientEvents.length > 0) {
    await db
      .collection('events')
      .updateMany(
        { _id: { $in: clientEvents.map(e => e._id) } },
        { $set: { 'payload.passbook': true, updatedAt: timestamp, migration } }
      )

    await db
      .collection('clients')
      .updateMany(
        { _id: { $in: clientEvents.map(e => e.objId) } },
        { $set: { passbook: true, updatedAt: timestamp } }
      )
  }

  await disconnect()
}

main()
