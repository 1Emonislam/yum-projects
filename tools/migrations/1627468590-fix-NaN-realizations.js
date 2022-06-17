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

const timezone = 'Africa/Kampala'

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  console.log('Looking for NaNs…')

  const db = await getDatabaseConnection(argv.env)

  const loans = await db.collection('loans').find().toArray()

  let loansWithNaNInRealizations = 0

  let suspects = []

  let events = []

  for (const loan of loans) {
    const installmentsWithNaNInRealizations = loan.installments.filter(
      installment => {
        return (
          installment.realization !== null && isNaN(installment.realization)
        )
      }
    )

    if (installmentsWithNaNInRealizations.length > 0) {
      const loanRelatedEvents = await db
        .collection('events')
        .find({ objId: loan._id })
        .toArray()

      suspects.push({
        loanId: String(loan._id),
        events: loanRelatedEvents.length,
        NaNs: installmentsWithNaNInRealizations.length,
        indexes: installmentsWithNaNInRealizations
          .map(i => {
            return loan.installments.findIndex(
              installment => String(installment._id) === String(i._id)
            )
          })
          .join(),
      })

      const installments = loan.installments.map((installment, index) => {
        if (isNaN(installment.realization)) {
          let loanRelatedEventsIndex = loanRelatedEvents.length - 1

          let isRealizationNaN = true

          while (isRealizationNaN && loanRelatedEventsIndex >= 0) {
            const realizationFromPreviousEvent =
              loanRelatedEvents[loanRelatedEventsIndex].payload.installments[
                index
              ].realization

            if (isNaN(realizationFromPreviousEvent)) {
              loanRelatedEventsIndex--
            } else {
              isRealizationNaN = false

              installment.realization = realizationFromPreviousEvent
            }
          }
        }

        return installment
      })

      events.push({
        _id: new BSON.ObjectId(),
        type: 'update',
        obj: 'loan',
        objId: loan._id,
        payload: { installments },
        timestamp: new Date(),
        migration: '1627468590-fix-NaN-realizations.js',
      })

      loansWithNaNInRealizations++
    }
  }

  if (!suspects.length) {
    console.log('No NaNs found, have a nice day :)')
    process.exit()
  }

  suspects.sort((a, b) => {
    const key = 'events'

    return b[key] - a[key]
  })

  console.table(suspects)

  console.log(
    'Loans with NaN in realizations:',
    loansWithNaNInRealizations,
    '(numbers in the table start from 0)'
  )

  // Log

  fs.writeFile(
    './../1627468590-fix-NaN-realizations.json',
    JSON.stringify(events),
    'utf8',
    err => {
      if (err) {
        console.log(`Error writing file: ${err}`)
      }
    }
  )

  // Save to Mongo

  console.log('Fixing the problem…')

  await db.collection('events').insertMany(events)

  console.log('')

  // Aggregate

  console.log('Aggregating…')

  try {
    await axios.post(
      'https://c08ia9zxje.execute-api.us-east-1.amazonaws.com/dev/aggregate-event-sourcing',
      {
        db: argv.env,
        views: ['loans', 'clientGroupsMeetings'],
      },
      {
        headers: {
          'x-api-key': [
            '7194ada75f8af997de70299449b5593bec17f1a38fbf0232d38abe1f808734af',
          ],
        },
      }
    )
  } catch (e) {
    console.log(e)
  }

  console.log('')

  await disconnect()
}

main()
