const _ = require('lodash')
const fs = require('fs')
const axios = require('axios')
const moment = require('moment-timezone')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')
const { generateLoan } = require('./../generators')
const { generateLoanCode } = require('./../generateCodes')
const { readCsv } = require('./../csv')

const { getDatabaseConnection, disconnect } = require('./../client')
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

  const { data: rawRecords, file: dataFile } = readCsv()

  const query = rawRecords.map(record => {
    const names = String(record['member full name']).trim().split(' ')
    const firstName = _.last(names)
    const lastName = _.first(names)

    return {
      firstName,
      lastName,
    }
  })

  const users = await db.collection('users').find().toArray()

  const clientGroups = await db.collection('clientGroups').find().toArray()

  const branches = await db.collection('branches').find().toArray()

  let loans = await db.collection('loans').find().toArray()

  const loanProducts = await db.collection('loanProducts').find().toArray()

  const holidays = await db.collection('holidays').find().toArray()

  const data = { users, loans, clientGroups, branches, loanProducts, holidays }

  const clients = await db
    .collection('clients')
    .find({
      $or: query,
    })
    .toArray()

  let events = []

  for (let record of rawRecords) {
    const names = String(record['member full name']).trim().split(' ')
    const firstName = _.last(names)
    const lastName = _.first(names)

    let client = clients.find(
      client => client.firstName === firstName && client.lastName === lastName
    )

    client._meta = {}
    client._meta.record = record

    const loan = generateLoan(data, client)

    loans.push(loan)

    events.push({
      _id: new BSON.ObjectId(),
      type: 'create',
      obj: 'loan',
      objId: new BSON.ObjectId(),
      payload: { ..._.omit(loan, ['_id']) },
      timestamp: new Date(),
      migration: '1629719189-add-missing-loans.js',
    })
  }

  for (let client of clients) {
    let clientLoans = loans.filter(
      loan => String(loan.clientId) === String(client._id)
    )

    events.push({
      _id: new BSON.ObjectId(),
      type: 'update',
      obj: 'client',
      objId: client._id,
      payload: {
        status: 'active',
        loans: clientLoans.map(loan => loan._id),
      },
      timestamp: new Date(),
      migration: '1629719189-add-missing-loans.js',
    })
  }

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Log

  fs.writeFile(
    './1629719189-add-missing-loans.json',
    JSON.stringify(events),
    'utf8',
    err => {
      if (err) {
        console.log(`Error writing file: ${err}`)
      }
    }
  )

  // // Save to Mongo

  if (events.length > 0) {
    console.log('Inserting…')

    await db.collection('events').insertMany(events)

    console.log('')
  }

  // // Aggregate

  // console.log('Aggregating…')

  // try {
  //   await axios.post(
  //     'https://c08ia9zxje.execute-api.us-east-1.amazonaws.com/dev/aggregate-event-sourcing',
  //     {
  //       db: argv.env,
  //       views: ['loans', 'clientGroupsMeetings'],
  //     },
  //     {
  //       headers: {
  //         'x-api-key': [
  //           '7194ada75f8af997de70299449b5593bec17f1a38fbf0232d38abe1f808734af',
  //         ],
  //       },
  //     }
  //   )
  // } catch (e) {
  //   console.log(e)
  // }

  // console.log('')

  await disconnect()
}

main()
