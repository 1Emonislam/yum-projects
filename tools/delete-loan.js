const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const fs = require('fs')
const lodash = require('lodash')
const path = require('path')
const yargs = require('yargs/yargs')

const timestamp = new Date()

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

  if (!argv.id) {
    console.log()
    interactive.error('Please specify --id <loan id>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const loan = await db.collection('loans').findOne({
    _id: ObjectId(argv.id),
  })

  if (!loan) {
    console.log()
    interactive.error('Please specify CORRECT --id <loan id>')
    console.log()
    process.exit(1)
  }

  const client = await db.collection('clients').findOne({
    _id: loan.clientId,
  })

  const migration = 'Deleting loan ' + loan._id

  let events = []

  // Loan

  events.push({
    _id: new ObjectId(),
    type: 'delete',
    obj: 'loan',
    objId: loan._id,
    timestamp,
    migration,
  })

  // Loan application

  if (loan?.forms?.application) {
    events.push({
      _id: new ObjectId(),
      type: 'delete',
      obj: 'form',
      objId: loan.forms.application,
      timestamp,
      migration,
    })
  }

  // Client inspection

  if (loan?.forms?.inspection) {
    events.push({
      _id: new ObjectId(),
      type: 'delete',
      obj: 'form',
      objId: loan.forms.inspection,
      timestamp,
      migration,
    })
  }

  // Security balance

  let securityTransaction

  if (loan.status === 'active') {
    securityTransaction = await db.collection('securityBalances').findOne({
      loanId: loan._id,
    })

    if (securityTransaction) {
      events.push({
        _id: new ObjectId(),
        type: 'delete',
        obj: 'securityTransaction',
        objId: securityTransaction._id,
        timestamp,
        migration,
      })
    }
  }

  // Client

  const securityBalance =
    client.securityBalance - (securityTransaction?.change || 0)

  events.push({
    _id: new ObjectId(),
    type: 'update',
    obj: 'client',
    objId: client._id,
    payload: {
      loans: client.loans.filter(loanId => String(loanId) !== String(loan._id)),
      securityBalance,
      status: securityBalance > 0 ? 'active' : 'toSurvey',
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
    console.log('Saving…')

    await db.collection('events').insertMany(events)

    await Promise.all(
      events
        .filter(event => event.type === 'update')
        .map(event =>
          db
            .collection(
              event.obj
                .replace('Transaction', 'Balance')
                .replace('clientGroupMeeting', 'clientGroupsMeeting') + 's'
            )
            .updateOne(
              { _id: event.objId },
              {
                $set: {
                  ...lodash.omit(event.payload, ['_id', 'createdAt']),
                  updatedAt: event.timestamp,
                },
              }
            )
        )
    )

    await Promise.all(
      events
        .filter(event => event.type === 'delete')
        .map(event =>
          db
            .collection(
              event.obj
                .replace('Transaction', 'Balance')
                .replace('clientGroupMeeting', 'clientGroupsMeeting') + 's'
            )
            .deleteOne({ _id: event.objId })
        )
    )

    console.log('')
  }

  await disconnect()
}

main()
