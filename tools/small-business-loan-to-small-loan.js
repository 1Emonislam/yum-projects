const _ = require('lodash')
const fs = require('fs')
const lodash = require('lodash')
const yargs = require('yargs/yargs')
const path = require('path')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')
const { ObjectId } = require('mongodb')
const moment = require('moment-timezone')

const timestamp = new Date()

const migration = path.parse(__filename).name

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

  if (!argv.loans) {
    console.log()
    interactive.error('Please specify --loans <id>,<id>,<id>')
    console.log()
    process.exit(1)
  }

  const loanIds = argv.loans.split(',')

  const db = await getDatabaseConnection(argv.env)

  const smallLoan = await db.collection('loanProducts').findOne({
    name: 'Small Loan 2022',
  })

  const smallBusinessLoan = await db.collection('loanProducts').findOne({
    name: 'Small Business Loan 2022',
  })

  const loans = await db
    .collection('loans')
    .find({
      _id: { $in: loanIds.map(id => ObjectId(id)) },
      loanProductId: { $ne: smallLoan._id },
    })
    .toArray()

  if (
    loans.some(
      loan => String(loan.loanProductId) !== String(smallBusinessLoan._id)
    )
  ) {
    console.log()
    interactive.error(
      'Please specify only Small Business Loans (2022 edition) in --loans <id>,<id>,<id>'
    )
    console.log()
    process.exit(1)
  }

  const clients = await db
    .collection('clients')
    .find({ _id: { $in: loans.map(loan => loan.clientId) } })
    .toArray()

  const securityTransactions = await db
    .collection('securityBalances')
    .find({
      clientId: { $in: clients.map(client => client._id) },
    })
    .toArray()

  let events = []

  for (let [index, loan] of loans.entries()) {
    // Loan

    const changes = {}

    changes.loanProductId = smallLoan._id
    changes.loanProductName = smallLoan.name

    const isInitialLoan = loan.cycle === 1

    changes.loanGracePeriod = smallLoan.gracePeriods.find(
      gracePeriod =>
        gracePeriod.durationValue === loan.duration.value &&
        gracePeriod.durationUnit === loan.duration.unit
    ).gracePeriodDays

    changes.cashCollateral =
      smallLoan.cashCollateral[isInitialLoan ? 'initialLoan' : 'furtherLoans']

    changes.loanInsurance = smallLoan.loanInsurance

    changes.interestRate = smallLoan.serviceCharges.find(
      charge =>
        charge.durationValue === loan.duration.value &&
        charge.durationUnit === loan.duration.unit
    ).charge

    events.push({
      _id: new ObjectId(),
      type: 'update',
      obj: 'loan',
      objId: loan._id,
      payload: changes,
      timestamp,
      migration,
    })

    if (loan.status === 'active') {
      // Security balance

      const client = clients.find(
        client => String(client._id) === String(loan.clientId)
      )

      const clientSecurityTransactions = securityTransactions
        .filter(
          transaction => String(transaction.clientId) === String(client._id)
        )
        .sort((a, b) => {
          if (!a.date || !b.date) {
            if (moment(a.createdAt).isBefore(moment(b.createdAt), 'day')) {
              return 1
            }

            if (moment(a.createdAt).isAfter(moment(b.createdAt), 'day')) {
              return -1
            }

            return 0
          }

          if (moment(a.date).isBefore(moment(b.date), 'day')) {
            return 1
          }

          if (moment(a.date).isAfter(moment(b.date), 'day')) {
            return -1
          }

          return 0
        })

      const loanDisbursementTransactions = clientSecurityTransactions.filter(
        transaction => transaction.comment === 'Loan disbursement'
      )

      const latestLoanDisbursementTransaction = loanDisbursementTransactions[0]

      const latestLoanDisbursementTransactionIndex =
        clientSecurityTransactions.findIndex(
          t => String(t._id) === String(latestLoanDisbursementTransaction._id)
        )

      const openingSecurityBalance =
        clientSecurityTransactions[latestLoanDisbursementTransactionIndex + 1]
          ?.closingSecurityBalance || 0

      const closingSecurityBalance =
        loan.approvedAmount * (changes.cashCollateral / 100)

      const change = closingSecurityBalance - openingSecurityBalance

      // Security balance: Update client

      events.push({
        _id: new ObjectId(),
        type: 'update',
        obj: 'client',
        objId: client._id,
        payload: {
          securityBalance: closingSecurityBalance,
        },
        timestamp,
        migration,
      })

      // Security balance: Update transaction

      events.push({
        _id: new ObjectId(),
        type: 'update',
        obj: 'securityTransaction',
        objId: latestLoanDisbursementTransaction._id,
        payload: {
          ..._.omit(latestLoanDisbursementTransaction, [
            '_id',
            'createdAt',
            'updatedAt',
            'userId',
          ]),
          openingSecurityBalance,
          closingSecurityBalance,
          change,
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
          .collection(
            event.obj
              .replace('Transaction', 'Balance')
              .replace('clientGroupMeeting', 'clientGroupsMeeting') + 's'
          )
          .updateOne(
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
