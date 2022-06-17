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

const migration =
  '1644914040-superfluous-security-from-product-financing-loans.js'

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const loans = await db
    .collection('loans')
    .find({
      loanProductName: 'Small Loan',
      'duration.value': 4,
      'duration.unit': 'week',
    })
    .toArray()

  const clients = await db
    .collection('clients')
    .find({
      _id: { $in: loans.map(loan => loan.clientId) },
    })
    .toArray()

  const securityTransactions = await db
    .collection('securityBalances')
    .find({
      clientId: { $in: loans.map(loan => loan.clientId) },
    })
    .toArray()

  let events = []

  for (let [index, loan] of loans.entries()) {
    console.log(`Loan ${index + 1}/${loans.length} (${loan._id})…`)

    // loans

    events.push({
      _id: new ObjectId(),
      type: 'update',
      obj: 'loan',
      objId: loan._id,
      payload: {
        cashCollateral: 0,
      },
      timestamp,
      migration,
    })

    // securityBalances

    const securityTransactionToBeRemoved = securityTransactions.find(
      transaction =>
        String(transaction.clientId) === String(loan.clientId) &&
        String(transaction.loanId) === String(loan._id)
    )

    let closingSecurityBalance

    if (securityTransactionToBeRemoved) {
      // Remove the incorrect transaction

      events.push({
        _id: new ObjectId(),
        type: 'delete',
        obj: 'securityTransaction',
        objId: securityTransactionToBeRemoved._id,
        timestamp,
        migration,
      })

      // Update the transactions after the incorrect transaction:

      const relatedSecurityTransactions = securityTransactions.filter(
        transaction =>
          String(transaction.clientId) === String(loan.clientId) &&
          String(transaction.loanId) !== String(loan._id)
      )

      let previousRelatedSecurityTransaction

      relatedSecurityTransactions.forEach(transaction => {
        if (
          transaction.comment !==
            'The initial security balance value generated from data in Yam' &&
          previousRelatedSecurityTransaction
        ) {
          if (
            transaction.openingSecurityBalance !==
            previousRelatedSecurityTransaction.closingSecurityBalance
          ) {
            const newOpeningSecurityBalance =
              previousRelatedSecurityTransaction.closingSecurityBalance

            events.push({
              _id: new ObjectId(),
              type: 'update',
              obj: 'securityTransaction',
              objId: transaction._id,
              payload: {
                openingSecurityBalance: newOpeningSecurityBalance,
                change:
                  transaction.closingSecurityBalance -
                  newOpeningSecurityBalance,
              },
              timestamp,
              migration,
            })
          }
        }

        closingSecurityBalance = transaction.closingSecurityBalance

        previousRelatedSecurityTransaction = transaction
      })
    }

    if (closingSecurityBalance) {
      const client = clients.find(
        client => String(client._id) === String(loan.clientId)
      )

      if (client.securityBalance !== closingSecurityBalance) {
        events.push({
          _id: new ObjectId(),
          type: 'update',
          obj: 'client',
          objId: client._id,
          payload: {
            securityBalance: closingSecurityBalance,
          },
          timestamp,
          migration,
        })
      }
    }
  }

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Log

  // fs.writeFile(
  //   './1644914040-superfluous-security-from-product-financing-loans.json',
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
        .filter(event => event.type === 'update')
        .map(event =>
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

    await Promise.all(
      events
        .filter(event => event.type === 'delete')
        .map(event =>
          db
            .collection(
              event.obj.replace('securityTransaction', 'securityBalance') + 's'
            )
            .deleteOne({ _id: event.objId })
        )
    )

    console.log('')
  }

  await disconnect()
}

main()
