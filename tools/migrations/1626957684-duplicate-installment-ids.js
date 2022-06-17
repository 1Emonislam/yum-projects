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

  const db = await getDatabaseConnection(argv.env)

  const loans = await db
    .collection('loans')
    .find({
      // _id: new BSON.ObjectId('60d0413b55394639a36129a6'), // TODO: Delete
    })
    // .limit(1) // TODO: Delete
    .toArray()

  let loansFixed = []

  let meetingsFixed = []

  let events = []

  let edits = {}

  // Guarantee unique installment IDs and reset (realizations, statuses)

  for (let [index, loan] of loans.entries()) {
    console.log(`Loan ${index + 1}/${loans.length} (${loan._id})…`)

    const loanCreateEvent = await db
      .collection('events')
      .find({
        type: 'create',
        obj: 'loan',
        objId: loan._id,
      })
      .next()

    loan.installments = loanCreateEvent.payload.installments

    // Find and apply manual edits

    const loanEditEvents = await db
      .collection('events')
      .find({
        type: 'update',
        obj: 'loan',
        objId: loan._id,
        'payload.edited': true,
        'payload.clientGroupName': { $exists: false },
      })
      .toArray()

    for (const edit of loanEditEvents) {
      edits[loan._id] = edit.timestamp

      for (const key of Object.keys(edit.payload)) {
        loan[key] = edit.payload[key]
      }
    }

    events.push({
      _id: new BSON.ObjectId(),
      type: 'update',
      obj: 'loan',
      objId: loan._id,
      payload: _.omit(loan, ['_id']),
      timestamp: new Date(),
      migration: '1626957684-duplicate-installment-ids.js',
    })

    loansFixed.push(loan)
  }

  // Fix installment IDs in meetings

  const meetings = await db
    .collection('clientGroupsMeetings')
    .find({
      // _id: new BSON.ObjectId('60d063ffcb86805bb0e8ef5a'), // TODO: Delete
      // clientGroupId: new BSON.ObjectId('60d0413b55394639a3612689'), // TODO: Delete
      // clientGroupId: { $in: loansFixed.map(loan => loan.clientGroupId) }, // Delete
    })
    // .limit(1) // TODO: Delete
    .toArray()

  for (let [index, meeting] of meetings.entries()) {
    console.log(
      `Meeting ${index + 1}/${meetings.length} (${String(meeting._id)})…`
    )

    meeting.installments = meeting.installments.map(installment => {
      const loan = loansFixed.find(
        loan => String(loan._id) === String(installment.loanId)
      )

      if (loan) {
        // TODO: Delete this condition, it's needed only for development and testing

        const fixedInstallment = loan.installments.find(l =>
          moment(l.due)
            .tz(timezone)
            .isSame(moment(meeting.createdAt).tz(timezone), 'day')
        )

        if (fixedInstallment) {
          installment._id = fixedInstallment._id
        } else {
          // It's an installment from an old not fully repaid loan
        }
      }

      return installment
    })

    events.push({
      _id: new BSON.ObjectId(),
      type: 'update',
      obj: 'meeting',
      objId: meeting._id,
      payload: _.omit(meeting, ['_id']),
      timestamp: new Date(),
      migration: '1626957684-duplicate-installment-ids.js',
    })

    meetingsFixed.push(meeting)
  }

  // Fix statuses (part I) and realizations

  for (const meeting of meetingsFixed) {
    for (const installment of meeting.installments) {
      if (
        !edits[installment.loanId] ||
        moment(meeting.createdAt).isAfter(moment(edits[installment.loanId]))
      ) {
        const event = events.find(
          e =>
            e.type === 'update' &&
            e.obj === 'loan' &&
            String(e.objId) === String(installment.loanId)
        )

        if (event) {
          // TODO: Delete this condition, it's needed only for development and testing

          let loan = event.payload

          loan._id = event.objId

          // Variables required for the code from realm/app/functions/updateLoanAfterMeeting.js to work

          const _id = installment._id

          let todaysRealization = Number(installment.todaysRealization)

          let installments = loan.installments

          // realm/app/functions/updateLoanAfterMeeting.js: Start

          const currentIndex = installments.findIndex(
            i => String(i._id) === String(_id)
          )

          if (currentIndex === -1) {
            throw new Error(`installment with id: ${_id} not found.`)
          }

          // console.log(installments[currentIndex])

          let {
            total,
            target,
            realization,
            status,
            wasLate,
            openingBalance,
          } = installments[currentIndex]

          const toPay = target - realization
          if (todaysRealization < toPay) {
            realization += todaysRealization
            todaysRealization = 0
            wasLate = true
            status = 'late'
          } else {
            realization += toPay
            todaysRealization -= toPay
            status = 'paid'
            wasLate = false
          }

          Object.assign(installments[currentIndex], {
            realization,
            status,
            openingBalance,
            wasLate,
            target,
          })

          installments = installments.map((installment, index) => {
            let {
              total,
              target,
              realization,
              status,
              wasLate,
              openingBalance,
            } = installment

            // FIXME: guards for realizations
            if (typeof realization === 'string') {
              realization.replaceAll(',', '.')
            }

            realization =
              realization === null ||
              realization === 'null' ||
              realization === undefined ||
              realization === 'undefined'
                ? 0
                : Number(realization)

            if (isNaN(realization)) {
              realization = 0
            }

            // CURRENT PAYMENT NOW
            if (String(installment._id) === String(_id)) {
              return installment
            }

            // PAST DUE PAYMENTS FIRST
            if (status === 'late' || index < currentIndex) {
              const toPay = target - realization
              wasLate = true
              if (todaysRealization >= toPay) {
                realization += toPay
                todaysRealization -= toPay
                status = 'paid'
              } else {
                realization += todaysRealization
                todaysRealization = 0
                status = 'late'
                wasLate = true
              }
            }

            return {
              ...installment,
              realization,
              status,
              openingBalance,
              wasLate,
              target,
            }
          })

          const futureInstallments = installments.slice(currentIndex)

          for (let i = futureInstallments.length - 1; i >= 0; i--) {
            const installment = futureInstallments[i]
            if (installment.target <= todaysRealization) {
              todaysRealization -= installment.target
              installment.target = 0
            } else {
              if (todaysRealization > 0) {
                installment.target = installment.target - todaysRealization
                todaysRealization -= installment.target
              }
            }
          }

          // realm/app/functions/updateLoanAfterMeeting.js: End

          const fixedLoanUpdateEventIndex = events.findIndex(
            e =>
              e.type === 'update' &&
              e.obj === 'loan' &&
              String(e.objId) === String(loan._id)
          )

          if (fixedLoanUpdateEventIndex === -1) {
            throw new Error('Double-check the code')
          }

          events[fixedLoanUpdateEventIndex].payload.installments = installments
        }
      } else if (
        moment(meeting.createdAt).isSameOrBefore(
          moment(edits[installment.loanId])
        )
      ) {
        console.log(
          `Loan ${installment.loanId}: Meeting ${meeting._id}: Meeting before the last edit of the loan: Ignoring`
        )
      }
    }
  }

  // Fix statuses (part II)

  events = events.map(event => {
    if (event.obj === 'loan') {
      event.payload.installments = event.payload.installments.map(
        installment => {
          if (
            installment.status !== 'late' &&
            installment.status !== 'paid' &&
            moment(installment.due).tz(timezone).isBefore(moment())
          ) {
            installment.status = 'late'
            installment.wasLate = true

            if (!installment.realization) {
              installment.realization = 0
            }
          }

          return installment
        }
      )
    }

    return event
  })

  // Fix realization in future installments

  events = events.map(event => {
    if (event.obj === 'loan') {
      event.payload.installments = event.payload.installments.map(
        installment => {
          if (installment.status === 'future') {
            installment.realization = null
          }

          return installment
        }
      )
    }

    return event
  })

  // Stats

  console.log('')

  console.log(events.length, 'events')

  console.log('')

  // Log

  fs.writeFile(
    './../1626957684-duplicate-installment-ids.json',
    JSON.stringify(events),
    'utf8',
    err => {
      if (err) {
        console.log(`Error writing file: ${err}`)
      }
    }
  )

  // Save to Mongo

  console.log('Inserting…')

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
