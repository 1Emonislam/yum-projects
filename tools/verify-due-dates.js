const _ = require('lodash')
const { getDatabaseConnection, disconnect } = require('./client')
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

  console.log(' ')
  console.log('Verifying…')
  console.log(' ')

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

  console.log('Loans:', loans.length)

  console.log('Clients:', clients.length)

  console.log('Groups:', clientGroups.length)

  console.log(' ')

  let problems = 0

  for (let [index, loan] of loans.entries()) {
    const client = clients.find(
      client => String(client._id) === String(loan.clientId)
    )

    const clientGroup = clientGroups.find(
      clientGroup => String(clientGroup._id) === String(client.clientGroupId)
    )

    const problem = loan.installments.some(
      installment =>
        moment(installment.due).tz(timezone).isoWeekday() !==
        clientGroup.meeting.dayOfWeek
    )

    if (problem) {
      problems++

      console.log(
        `${problems}. https://app.yamafrica.com/clients/${loan.clientId}/loans/${loan._id}`
      )
    }
  }

  console.log(' ')

  if (problems === 0) {
    console.log('Due dates: OK')
    console.log(' ')
  }

  await disconnect()
}

main()
