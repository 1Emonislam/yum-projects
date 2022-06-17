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

  const loans = await db.collection('loans').find({}).toArray()

  let meetingsCorrect = []

  let events = []

  let edits = {}

  // Take all of the loans back to better times

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

    const originalIDs = JSON.parse(
      JSON.stringify(loan.installments.map(installment => installment._id))
    )

    for (const edit of loanEditEvents) {
      edits[String(loan._id)] = edit.timestamp

      for (const key of Object.keys(edit.payload)) {
        loan[key] = edit.payload[key]

        if (key === 'installments') {
          loan.installments = loan.installments.map((installment, index) => {
            installment._id = originalIDs[index]

            return installment
          })
        }
      }
    }

    events.push({
      _id: new BSON.ObjectId(),
      type: 'update',
      obj: 'loan',
      objId: loan._id,
      payload: _.omit(loan, ['_id']),
      timestamp: new Date(),
      migration: '1628160069-fix-loan-updates-after-meetings.js',
    })
  }

  // Fix installment IDs in meetings that include edited loans

  const meetings = await db
    .collection('clientGroupsMeetings')
    .find({})
    .toArray()

  for (let [index, meeting] of meetings.entries()) {
    console.log(
      `Meeting ${index + 1}/${meetings.length} (${String(meeting._id)})…`
    )

    let isMeetingCorrect = true

    meeting.installments = meeting.installments.map(installment => {
      if (
        edits[String(installment.loanId)] &&
        moment(meeting.createdAt).isAfter(moment(edits[installment.loanId]))
      ) {
        isMeetingCorrect = false

        const event = events.find(
          e =>
            e.type === 'update' &&
            e.obj === 'loan' &&
            String(e.objId) === String(installment.loanId)
        )

        if (event) {
          // TODO: Delete this condition, it's needed only for development and testing

          const loan = event.payload

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
      }

      return installment
    })

    if (!isMeetingCorrect) {
      events.push({
        _id: new BSON.ObjectId(),
        type: 'update',
        obj: 'meeting',
        objId: meeting._id,
        payload: _.omit(meeting, ['_id']),
        timestamp: new Date(),
        migration: '1628160069-fix-loan-updates-after-meetings.js',
      })
    }

    meetingsCorrect.push(meeting)
  }

  // Replay the meetings AKA fix statuses (part I) and realizations

  for (const meeting of meetingsCorrect) {
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

          console.log('') // TODO: Delete
          console.log(
            `Loan ${installment.loanId}: Meeting ${meeting._id} (${moment(
              meeting.createdAt
            ).format('DD.MM.YYYY')}): Realization ${
              installment.todaysRealization
            }: Replaying…`
          )

          let loan = event.payload

          loan._id = event.objId

          // Variables required for the code from realm/app/functions/updateLoanAfterMeeting.js to work

          const _id = installment._id

          let todaysRealization = installment.todaysRealization

          let installments = loan.installments

          // realm/app/functions/updateLoanAfterMeeting.js: Start

          const currentIndex = installments.findIndex(
            i => String(i._id) === String(_id)
          )

          if (currentIndex === -1) {
            throw new Error(`installment with id: ${_id} not found.`)
          }

          let {
            total,
            target,
            realization,
            status,
            wasLate,
            openingBalance,
          } = installments[currentIndex]

          if (!realization) {
            realization = 0
          }

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

          const futureInstallments = installments.slice(currentIndex + 1)

          for (let i = futureInstallments.length - 1; i >= 0; i--) {
            const installment = futureInstallments[i]

            if (installment.total <= todaysRealization) {
              installment.target = 0
              todaysRealization -= installment.total
            } else {
              if (todaysRealization > 0) {
                installment.target = installment.target - todaysRealization
                todaysRealization -= installment.total
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
        console.log('') // TODO: Delete
        console.log(
          `Loan ${installment.loanId}: Meeting ${meeting._id} (${moment(
            meeting.createdAt
          ).format(
            'DD.MM.YYYY'
          )}): Meeting before the last edit of the loan: Ignoring…`
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

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Log

  fs.writeFile(
    './../1628160069-fix-loan-updates-after-meetings.json',
    JSON.stringify(events),
    'utf8',
    err => {
      if (err) {
        console.log(`Error writing file: ${err}`)
      }
    }
  )

  // // Save to Mongo

  // console.log('Inserting…')

  // await db.collection('events').insertMany(events)

  // console.log('')

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
