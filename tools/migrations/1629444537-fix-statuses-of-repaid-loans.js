const _ = require('lodash')
const fs = require('fs')
const axios = require('axios')
const moment = require('moment-timezone')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')

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

  const loans = await db.collection('loans').find({}).toArray()

  let events = []

  // Take all of the loans back to better times

  for (let loan of loans) {
    const interestAmount = loan.approvedAmount * (loan.interestRate / 100)

    const disbursedAmount = loan.approvedAmount + interestAmount

    const cumulativeRealization = loan.installments.reduce(
      (acc, installment = {}) => {
        const { realization = 0, total, target } = installment
        return acc + realization + (total - target)
      },
      0
    )

    if (cumulativeRealization === disbursedAmount && loan.status === 'active') {
      loan.status = 'repaid'

      loan.installments = loan.installments.map(installment => {
        if (installment.target === 0) {
          installment.status = 'paid'
        }

        return installment
      })

      events.push({
        _id: new BSON.ObjectId(),
        type: 'update',
        obj: 'loan',
        objId: loan._id,
        payload: {
          status: loan.status,
          installments: loan.installments,
        },
        timestamp: new Date(),
        migration: '1629444537-fix-statuses-of-repaid-loans.js',
      })
    }
  }

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Log

  fs.writeFile(
    './1629444537-fix-statuses-of-repaid-loans.json',
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
