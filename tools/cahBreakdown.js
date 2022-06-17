const _ = require('lodash')
const fs = require('fs')
const lodash = require('lodash')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')
const moment = require('moment')

const { getDatabaseConnection, disconnect, ObjectId } = require('./client')

const initCAH = require('../server/resolvers/legacy/initCashAtHandReport')

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

  const dataSources = {
    branches: { collection: db.collection('branches') },
    cashAtHandForms: { collection: db.collection('cashAtHandForms') },
    clientGroups: { collection: db.collection('clientGroups') },
    clientGroupsMeetings: { collection: db.collection('clientGroupsMeetings') },
    clients: { collection: db.collection('clients') },
    events: { collection: db.collection('events') },
    feedback: { collection: db.collection('feedback') },
    forms: { collection: db.collection('forms') },
    holidays: { collection: db.collection('holidays') },
    loanProducts: { collection: db.collection('loanProducts') },
    loans: { collection: db.collection('loans') },
    securityBalances: { collection: db.collection('securityBalances') },
    settings: { collection: db.collection('settings') },
    users: { collection: db.collection('users') },
  }

  const branches = await db.collection('branches').find().limit(0).toArray()

  const startDateString = '2021-10-15T12:00:00Z'
  const endDateString = '2021-10-18T12:00:00Z'

  for (let branch of branches) {
    const endDate = moment(endDateString)

    const results = {}

    for (
      const date = moment(startDateString);
      date.isSameOrBefore(endDate);
      date.add(1, 'days')
    ) {
      const result = await initCAH(
        undefined,
        {
          input: {
            branchId: branch._id.toHexString(),
            date,
          },
        },
        { dataSources },
        { detailedBreakdown: true }
      )

      results[date.format('MMMM D, YYYY')] = result
    }

    console.log(branch.name)
    console.table(results)
  }

  await disconnect()
}

main()
