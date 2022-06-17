const _ = require('lodash')
const fs = require('fs')
const lodash = require('lodash')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')

const { getDatabaseConnection, disconnect } = require('./client')
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

  const clients = await db.collection('clients').find().toArray()

  const clientGroups = await db.collection('clientGroups').find().toArray()

  const loans = await db
    .collection('loans')
    .find({ status: 'active' })
    .toArray()

  let events = []

  for (let [index, client] of clients.entries()) {
    console.log(`Client ${index + 1}/${clients.length} (${client._id})…`)

    const clientLoans = loans.filter(
      loan => String(loan.clientId) === String(client._id)
    )

    const clientLoansCopyToReverse = JSON.parse(JSON.stringify(clientLoans))

    const clientLoansReversed = clientLoansCopyToReverse.reverse()

    let securityBalance = 0

    if (clientLoansReversed.length > 0) {
      const loan = clientLoansReversed[0] // Take the newest loan

      securityBalance = loan.approvedAmount * (loan.cashCollateral / 100)

      events.push({
        _id: new BSON.ObjectId(),
        type: 'create',
        obj: 'securityTransaction',
        objId: client._id,
        payload: {
          branchId: clientGroups.find(
            clientGroup =>
              String(clientGroup._id) === String(client.clientGroupId)
          )._id,
          clientId: client._id,
          loanId: new BSON.ObjectId(loan._id),
          comment:
            'The initial security balance value generated from data in Yam',
          openingSecurityBalance: 0,
          closingSecurityBalance: securityBalance,
          change: securityBalance,
        },
        timestamp: new Date(),
        migration: 'populate-security-balances.js',
      })
    }

    events.push({
      _id: new BSON.ObjectId(),
      type: 'update',
      obj: 'client',
      objId: client._id,
      payload: {
        securityBalance,
      },
      timestamp: new Date(),
      migration: 'populate-security-balances.js',
    })
  }

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Log

  // fs.writeFile(
  //   './populate-security-balances.json',
  //   JSON.stringify(events),
  //   'utf8',
  //   err => {
  //     if (err) {
  //       console.log(`Error writing file: ${err}`)
  //     }
  //   }
  // )

  // Save to Mongo

  const delay = ms => new Promise(res => setTimeout(res, ms))

  if (events.length > 0) {
    console.log('Inserting…')

    await db.collection('events').insertMany(events)

    await delay(10000)

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

    await delay(10000)

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
