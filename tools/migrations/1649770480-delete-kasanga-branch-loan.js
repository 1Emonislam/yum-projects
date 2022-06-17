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

const meta = 'https://yamafrica.freshdesk.com/a/tickets/243'

const loanId = '62544e3853f5886ea985d7b7'

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  // Naliggo Frank Jane's loan
  const loanToBeDeleted = await db.collection('loans').findOne({
    _id: ObjectId(loanId),
  })

  if (!loanToBeDeleted) {
    await disconnect()
    return
  }

  const client = await db
    .collection('clients')
    .findOne({ _id: loanToBeDeleted.clientId })

  const events = []

  events.push({
    _id: ObjectId(),
    type: 'delete',
    obj: 'loan',
    objId: loanToBeDeleted._id,
    timestamp,
    migration,
    meta,
  })

  events.push({
    _id: ObjectId(),
    type: 'delete',
    obj: 'form',
    objId: loanToBeDeleted.forms.application,
    timestamp,
    migration,
    meta,
  })

  events.push({
    _id: ObjectId(),
    type: 'delete',
    obj: 'form',
    objId: loanToBeDeleted.forms.inspection,
    timestamp,
    migration,
    meta,
  })

  const loans = client.loans.filter(loan => String(loan) !== loanId)

  events.push({
    _id: ObjectId(),
    type: 'update',
    obj: 'client',
    objId: client._id,
    payload: {
      loans,
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

    await db.collection('loans').deleteOne({ _id: loanToBeDeleted._id })

    await db
      .collection('forms')
      .deleteOne({ _id: loanToBeDeleted.forms.application })

    await db
      .collection('forms')
      .deleteOne({ _id: loanToBeDeleted.forms.inspection })

    await db
      .collection('clients')
      .updateOne({ _id: client._id }, { $set: { loans, updatedAt: timestamp } })

    console.log('')
  }

  await disconnect()
}

main()
