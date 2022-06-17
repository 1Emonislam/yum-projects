const _ = require('lodash')
const { getDatabaseConnection, disconnect } = require('./../client')
const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const path = require('path')
const yargs = require('yargs/yargs')
const moment = require('moment-timezone')
const fs = require('fs')

const timezone = 'Africa/Kampala'

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

const timestamp = new Date()

const migration = path.parse(__filename).name

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const eventsWithLoanIds = await db
    .collection('events')
    .find(
      {
        migration: '1650275242-installment-due-dates',
      },
      {
        objId: 1,
      }
    )
    .toArray()

  // const eventsWithLoanIds = [
  //   {
  //     objId: ObjectId('625587df581a5a2015b8a189'),
  //   },
  // ]

  const loans = await db
    .collection('loans')
    .find({
      _id: { $in: eventsWithLoanIds.map(event => event.objId) },
    })
    .toArray()

  const clients = await db
    .collection('clients')
    .find({
      _id: { $in: loans.map(loan => loan.clientId) },
    })
    .toArray()

  const clientGroups = await db
    .collection('clientGroups')
    .find({
      _id: { $in: clients.map(client => client.clientGroupId) },
    })
    .toArray()

  let events = []

  for (let [index, loan] of loans.entries()) {
    console.log(`Loan ${index + 1}/${loans.length} (${loan._id})…`)

    const client = clients.find(
      client => String(client._id) === String(loan.clientId)
    )

    const clientGroup = clientGroups.find(
      clientGroup => String(clientGroup._id) === String(client.clientGroupId)
    )

    let event = false

    const installments = loan.installments.map(installment => {
      if (
        moment(installment.due).tz(timezone).isoWeekday() !==
        clientGroup.meeting.dayOfWeek
      ) {
        let newDueDate

        const dayForward = moment(installment.due).tz(timezone).add(1, 'day')
        const twoDaysForward = moment(installment.due)
          .tz(timezone)
          .add(2, 'day')
        const threeDaysForward = moment(installment.due)
          .tz(timezone)
          .add(3, 'day')
        const dayBack = moment(installment.due).tz(timezone).subtract(1, 'day')
        const twoDaysBack = moment(installment.due)
          .tz(timezone)
          .subtract(2, 'day')
        const threeDaysBack = moment(installment.due)
          .tz(timezone)
          .subtract(3, 'day')

        if (dayForward.isoWeekday() === clientGroup.meeting.dayOfWeek) {
          event = true

          newDueDate = dayForward
        } else if (
          twoDaysForward.isoWeekday() === clientGroup.meeting.dayOfWeek
        ) {
          event = true

          newDueDate = twoDaysForward
        } else if (
          threeDaysForward.isoWeekday() === clientGroup.meeting.dayOfWeek
        ) {
          event = true

          newDueDate = threeDaysForward
        } else if (dayBack.isoWeekday() === clientGroup.meeting.dayOfWeek) {
          event = true

          newDueDate = dayBack
        } else if (twoDaysBack.isoWeekday() === clientGroup.meeting.dayOfWeek) {
          event = true

          newDueDate = twoDaysBack
        } else if (
          threeDaysBack.isoWeekday() === clientGroup.meeting.dayOfWeek
        ) {
          event = true

          newDueDate = threeDaysBack
        } else {
          throw new Error(
            'Unhandled edge case: https://app.yamafrica.com/clients/' +
              loan.clientId +
              '/loans/' +
              loan._id +
              ' (installment day ' +
              moment(installment.due).tz(timezone).isoWeekday() +
              ', group day ' +
              clientGroup.meeting.dayOfWeek +
              ')'
          )
        }

        installment.due = newDueDate.toDate()
      }

      return installment
    })

    if (event) {
      events.push({
        _id: new ObjectId(),
        type: 'update',
        obj: 'loan',
        objId: loan._id,
        payload: {
          installments,
        },
        timestamp,
        migration,
      })
    }
  }

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
    console.log('Inserting…')

    await db.collection('events').insertMany(events)

    await Promise.all(
      events.map(event =>
        db
          .collection(event.obj.replace('Transaction', 'Balance') + 's')
          .updateOne(
            { _id: event.objId },
            {
              $set: {
                ..._.omit(event.payload, ['_id', 'createdAt']),
                updatedAt: event.timestamp,
              },
            }
          )
      )
    )
  }

  await disconnect()
}

main()
