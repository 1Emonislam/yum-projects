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
const lodash = require('lodash')

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
    const firstName = String(_.capitalize(_.last(names))).trim()
    const lastName = String(_.capitalize(_.first(names))).trim()

    return {
      firstName,
      lastName,
    }
  })

  const loans = await db.collection('loans').find().toArray()

  const clients = await db
    .collection('clients')
    .find({
      $or: query,
    })
    .toArray()

  let events = []

  for (let record of rawRecords) {
    const names = String(record['member full name']).trim().split(' ')
    const firstName = String(_.capitalize(_.last(names))).trim()
    const lastName = String(_.capitalize(_.first(names))).trim()

    const client = clients.find(
      client => client.firstName === firstName && client.lastName === lastName
    )

    if (client) {
      let clientLoans = loans.filter(
        loan => String(loan.clientId) === String(client._id)
      )

      let updateClient = false

      clientLoans.forEach(loan => {
        if (loan.status === 'awaitingManagerReview') {
          updateClient = true

          events.push({
            _id: new BSON.ObjectId(),
            type: 'update',
            obj: 'loan',
            objId: loan._id,
            payload: {
              status: 'active',
              approvedAmount: loan.requestedAmount,
            },
            timestamp: new Date(),
            migration: '1631110869-add-missing-data-from-import-2021-09-08.js',
          })
        }
      })

      if (updateClient) {
        events.push({
          _id: new BSON.ObjectId(),
          type: 'update',
          obj: 'client',
          objId: client._id,
          payload: {
            status: 'active',
          },
          timestamp: new Date(),
          migration: '1631110869-add-missing-data-from-import-2021-09-08.js',
        })
      }
    } else {
      console.log('Error:', lastName, firstName)
    }
  }

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Log

  fs.writeFile(
    './1631110869-add-missing-data-from-import-2021-09-08.js',
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

    await Promise.all(
      events.map(event =>
        db.collection(event.obj === 'client' ? 'clients' : 'loans').updateOne(
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
