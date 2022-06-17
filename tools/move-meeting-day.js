const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const fs = require('fs')
const lodash = require('lodash')
const moment = require('moment-timezone')
const path = require('path')
const yargs = require('yargs/yargs')
const { generateDueDates } = require('shared/utils')

const timezone = 'Africa/Kampala'

const timestamp = new Date()

const transactionName = 'MOVE_MEETING_DAY'

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

  if (!argv.for) {
    console.log()
    interactive.error('Please specify --for <client group id>')
    console.log()
    process.exit(1)
  }

  if (!argv.from) {
    console.log()
    interactive.error(
      'Please specify --from <day of week> (1 - Monday, 5 - Friday)'
    )
    console.log()
    process.exit(1)
  }

  if (!argv.to) {
    console.log()
    interactive.error(
      'Please specify --to <day of week> (1 - Monday, 5 - Friday)'
    )
    console.log()
    process.exit(1)
  }

  if (Number(argv.to) > 5 || Number(argv.to) < 1) {
    console.log()
    interactive.error(
      'Please specify --to <day of week> between 1 (Monday) and 5 (Friday)'
    )
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const clientGroup = await db.collection('clientGroups').findOne({
    _id: ObjectId(argv.for),
  })

  if (!clientGroup) {
    console.log()
    interactive.error('Please specify CORRECT --for <client group id>')
    console.log()
    process.exit(1)
  }

  if (clientGroup.meeting.dayOfWeek !== Number(argv.from)) {
    console.log()
    interactive.error(
      `Please specify CORRECT --from <day of week> (${
        clientGroup.meeting.dayOfWeek
      } - ${moment().isoWeekday(clientGroup.meeting.dayOfWeek).format('dddd')})`
    )
    console.log()
    process.exit(1)
  }

  const clients = await db
    .collection('clients')
    .find({
      clientGroupId: clientGroup._id,
    })
    .toArray()

  const loans = await db
    .collection('loans')
    .find({
      clientId: { $in: clients.map(client => client._id) },
      status: 'active',
    })
    .toArray()

  const holidays = await db.collection('holidays').find().toArray()

  let events = []

  const loansToRecalculate = clients.some(client => client.status === 'active')

  const domainEvent = {
    _id: new ObjectId(),
    type: 'moveMeetingDay',
    payload: {
      clientGroupId: clientGroup._id,
      from: moment().isoWeekday(argv.from).format('dddd'),
      to: moment().isoWeekday(argv.to).format('dddd'),
      recalculation: loansToRecalculate,
    },
    transactionName,
    timestamp,
  }

  events.push(domainEvent)

  const parentId = domainEvent._id

  events.push({
    _id: new ObjectId(),
    type: 'update',
    obj: 'clientGroup',
    objId: clientGroup._id,
    payload: {
      meeting: { ...clientGroup.meeting, dayOfWeek: Number(argv.to) },
    },
    timestamp,
    parentId,
    transactionName,
  })

  if (loansToRecalculate) {
    loans.forEach(loan => {
      const firstFutureInstallment = loan.installments.findIndex(installment =>
        moment(installment.due)
          .tz(timezone)
          .isAfter(moment().tz(timezone), 'day')
      )

      if (firstFutureInstallment !== -1) {
        const initialInstallment =
          firstFutureInstallment > 0 ? firstFutureInstallment - 1 : 0

        const initialDueDate = moment(loan.installments[initialInstallment].due)
          .tz(timezone)
          .isoWeekday(Number(argv.to))
          .add(initialInstallment > 0 ? 1 : 0, 'week')

        if (
          moment().tz(timezone).isoWeekday() !== Number(argv.from) &&
          Number(argv.to) < Number(argv.from) &&
          initialDueDate.week() ===
            moment(loan.installments[initialInstallment].due).week()
        ) {
          initialDueDate.add(1, 'week')
        }

        if (initialDueDate.isBefore(moment().tz(timezone), 'day')) {
          initialDueDate.add(1, 'week')
        }

        if (initialDueDate.isBefore(moment().tz(timezone), 'day')) {
          initialDueDate.add(1, 'week')
        }

        const dueDates = generateDueDates({
          initialDueDate,
          numberOfDueDates: loan.duration.value - initialInstallment,
          frequencyOfDueDates: loan.duration.unit,
          holidays: holidays,
          futureOnly: false,
        })

        let changedInstallments = 0

        const installments = loan.installments.map(installment => {
          if (
            moment(installment.due)
              .tz(timezone)
              .isAfter(moment().tz(timezone), 'day')
          ) {
            installment.due = dueDates[changedInstallments].toDate()

            changedInstallments++
          } else {
            installment.due = moment(installment.due).tz(timezone).toDate()
          }

          return installment
        })

        const updateLoanEvent = {
          _id: ObjectId(),
          type: 'update',
          obj: 'loan',
          objId: loan._id,
          payload: { installments },
          parentId,
          transactionName,
          timestamp,
        }

        events.push(updateLoanEvent)
      }
    })
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
    console.log('Saving…')

    await db.collection('events').insertMany(events)

    await Promise.all(
      events.map(event =>
        db.collection(event.obj + 's').updateOne(
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

    console.log('')
  }

  await disconnect()
}

main()
