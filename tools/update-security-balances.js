const _ = require('lodash')
const fs = require('fs')
const lodash = require('lodash')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')
const { ObjectId } = require('mongodb')
const { getDatabaseConnection, disconnect } = require('./client')

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  if (!argv.clients) {
    console.log()
    interactive.error('Please specify --clients <id,id,id>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const clientIds = argv.clients.split(',')

  const clients = await db
    .collection('clients')
    .find({
      _id: { $in: clientIds.map(id => ObjectId(id)) },
    })
    .toArray()

  const clientGroups = await db
    .collection('clientGroups')
    .find({
      _id: { $in: clients.map(client => client.clientGroupId) },
    })
    .toArray()

  const loans = await db
    .collection('loans')
    .find({
      clientId: { $in: clientIds.map(id => new ObjectId(id)) },
      status: 'active',
    })
    .toArray()

  let events = []

  for (let [index, client] of clients.entries()) {
    console.log(`Client ${index + 1}/${clients.length} (${client._id})…`)

    const clientLoans = loans.filter(
      loan => String(loan.clientId) === String(client._id)
    )

    const loan = clientLoans[clientLoans.length - 1]

    const securityBalance = loan.approvedAmount * (loan.cashCollateral / 100)

    if (securityBalance !== client.securityBalance) {
      events.push({
        _id: new ObjectId(),
        type: 'update',
        obj: 'client',
        objId: client._id,
        payload: {
          securityBalance,
        },
        timestamp: new Date(),
        migration: 'update-security-balances.js',
      })

      events.push({
        _id: new ObjectId(),
        type: 'create',
        obj: 'securityTransaction',
        objId: client._id,
        payload: {
          branchId: clientGroups.find(
            clientGroup =>
              String(clientGroup._id) === String(client.clientGroupId)
          )._id,
          clientId: client._id,
          loanId: new ObjectId(loan._id),
          comment:
            'Security balance generated via yarn update-security-balances',
          openingSecurityBalance: client.securityBalance || 0,
          closingSecurityBalance: securityBalance,
          change: securityBalance - (client.securityBalance || 0),
        },
        timestamp: new Date(),
        migration: 'update-security-balances.js',
      })
    }
  }

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Log

  // fs.writeFile(
  //   './update-security-balances.json',
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
      events
        .filter(event => event.obj === 'client')
        .map(event =>
          db.collection('clients').updateOne(
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

    await db.collection('securityBalances').insertMany(
      events
        .filter(event => event.obj === 'securityTransaction')
        .map(event => {
          return {
            _id: event.objId,
            createdAt: event.timestamp,
            ...event.payload,
          }
        })
    )

    console.log('')
  }

  await disconnect()
}

main()
