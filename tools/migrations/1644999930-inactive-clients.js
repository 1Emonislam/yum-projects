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

  const ntinda = await db.collection('branches').findOne({
    name: 'Ntinda',
  })

  const clientGroups = await db
    .collection('clientGroups')
    .find({
      branchId: ntinda._id,
    })
    .toArray()

  const clients = await db
    .collection('clients')
    .find({
      securityBalance: 0,
      status: 'active',
      clientGroupId: { $in: clientGroups.map(clientGroup => clientGroup._id) },
    })
    .toArray()

  const loans = await db
    .collection('loans')
    .find({
      clientId: { $in: clients.map(client => client._id) },
    })
    .toArray()

  let events = []

  for (let [index, client] of clients.entries()) {
    console.log(`Client ${index + 1}/${clients.length} (${client._id})…`)

    const clientLoans = loans.filter(
      loan => String(loan.clientId) === String(client._id)
    )

    if (clientLoans.every(loan => loan.status === 'repaid')) {
      events.push({
        _id: new ObjectId(),
        type: 'update',
        obj: 'client',
        objId: client._id,
        payload: {
          status: 'inactive',
        },
        timestamp,
        migration,
      })
    }
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

    await Promise.all(
      events.map(event =>
        db
          .collection(
            event.obj.replace('securityTransaction', 'securityBalance') + 's'
          )
          .updateOne(
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
