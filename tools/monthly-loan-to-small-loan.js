const _ = require('lodash')
const { generateInstallments } = require('shared/utils/index.js')
const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const fs = require('fs')
const moment = require('moment-timezone')
const path = require('path')
const yargs = require('yargs/yargs')

const timezone = 'Africa/Kampala'

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

  if (!argv.weeks) {
    console.log()
    interactive.error('Please specify --weeks <number>')
    console.log()
    process.exit(1)
  }

  const loanIds = argv.loans.split(',')

  const durationValue = argv.weeks

  const db = await getDatabaseConnection(argv.env)

  const smallLoan = await db.collection('loanProducts').findOne({
    name: 'Small Loan 2022',
  })

  const loans = await db
    .collection('loans')
    .find({
      _id: { $in: loanIds.map(id => ObjectId(id)) },
      loanProductId: { $ne: smallLoan._id },
    })
    .toArray()

  const clients = await db
    .collection('clients')
    .find({ _id: { $in: loans.map(loan => loan.clientId) } })
    .toArray()

  const holidays = await db.collection('holidays').find().toArray()

  let events = []

  for (let [index, loan] of loans.entries()) {
    console.log('--------------------------------------')
    console.log(`Loan ${index + 1}/${loans.length} (${loan._id})…`)
    console.log(
      `http://localhost:3000/clients/${loan.clientId}/loans/${loan._id}`
    )

    // Loan

    const changes = {}

    changes.duration = {
      value: durationValue,
      unit: 'week',
    }

    changes.loanProductId = smallLoan._id
    changes.loanProductName = smallLoan.name

    const isInitialLoan = loan.cycle === 1

    const cashCollateral =
      smallLoan.cashCollateral[isInitialLoan ? 'initialLoan' : 'furtherLoans']

    if (cashCollateral !== loan.cashCollateral) {
      changes.cashCollateral = cashCollateral
    }

    const loanInsurance = smallLoan.loanInsurance

    if (loanInsurance !== loan.loanInsurance) {
      changes.loanInsurance = loanInsurance
    }

    const interestRate = smallLoan.serviceCharges.find(
      charge =>
        charge.durationValue === durationValue && charge.durationUnit === 'week'
    ).charge

    if (interestRate !== loan.interestRate) {
      changes.interestRate = interestRate
    }

    const installments = generateInstallments({
      principal: loan.approvedAmount,
      duration: { value: durationValue, unit: 'week' },
      toDate: true,
      interestRateInPercents: interestRate,
      startDate: moment(loan.installments[0].due),
      holidays,
    })

    let totalRealization = loan.installments.reduce((acc, installment = {}) => {
      const { realization = 0, total, target } = installment
      return acc + realization + (total - target)
    }, 0)

    const installmentsBeforeToday = installments.filter(installment =>
      moment(installment.due).tz(timezone).isSameOrBefore(moment(), 'day')
    )

    const futureInstallments = installments.slice(
      installmentsBeforeToday.length
    )

    for (let installment of installmentsBeforeToday) {
      if (installment.target <= totalRealization) {
        installment.realization = parseInt(installment.target)
        installment.status = 'paid'
        totalRealization -= installment.total
      } else {
        if (totalRealization > 0) {
          installment.realization = parseInt(totalRealization)
          totalRealization -= installment.target
        }
      }
    }

    for (let i = futureInstallments.length - 1; i >= 0; i--) {
      const installment = futureInstallments[i]
      if (installment.total <= totalRealization) {
        installment.target = 0
        installment.status = 'paid'
        totalRealization -= installment.total
      } else {
        if (totalRealization > 0) {
          installment.target = parseInt(installment.total - totalRealization)
          totalRealization -= installment.total
        }
      }
    }

    const installmentsWithPreviousIds = installments.map((installment, i) => {
      const previousInstallment = loan.installments[i]

      if (previousInstallment) {
        const id = previousInstallment._id

        if (id) {
          installment._id = id
        }
      }

      return installment
    })

    const installmentsWithCorrectLateStatuses = installmentsWithPreviousIds.map(
      installment => {
        if (
          moment(installment.due)
            .tz(timezone)
            .isBefore(moment().tz(timezone), 'day') &&
          (!installment.realization ||
            installment.realization < installment.target)
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

    changes.installments = installmentsWithCorrectLateStatuses

    events.push({
      _id: new ObjectId(),
      type: 'update',
      obj: 'loan',
      objId: loan._id,
      payload: changes,
      timestamp,
      migration,
    })

    if (loan.status === 'active' && loan.cashCollateral !== cashCollateral) {
      // Security balance

      const client = clients.find(
        client => String(client._id) === String(loan.clientId)
      )

      const securityBalanceBefore =
        loan.approvedAmount * (loan.cashCollateral / 100)

      const securityBalanceAfter =
        loan.approvedAmount * (changes.cashCollateral / 100)

      const securityBalanceChange = securityBalanceBefore - securityBalanceAfter

      // Security balance: Update client

      events.push({
        _id: new ObjectId(),
        type: 'update',
        obj: 'client',
        objId: client._id,
        payload: {
          securityBalance: client.securityBalance - securityBalanceChange,
        },
        timestamp,
        migration,
      })

      // Security balance: Add transaction

      console.log(
        `cashCollateral: ${loan.cashCollateral} → ${changes.cashCollateral}`
      )
      console.log(
        `security: ${securityBalanceBefore} → ${securityBalanceAfter}`
      )
      console.log('securityBalanceChange:', securityBalanceChange)

      events.push({
        _id: new ObjectId(),
        type: 'create',
        obj: 'securityTransaction',
        objId: new ObjectId(),
        payload: {
          branchId: loan.branchId,
          clientId: loan.clientId,
          loanId: loan._id,
          comment: 'Small Business Loan 2022 → Small Loan 2022',
          openingSecurityBalance: client.securityBalance,
          closingSecurityBalance:
            client.securityBalance - securityBalanceChange,
          change: securityBalanceChange,
          date: loan.disbursementAt,
        },
        timestamp,
        migration,
      })
    }
  }

  console.log('--------------------------------------')

  // Stats

  console.log('')

  console.log(events.length, 'event(s) to send to MongoDB')

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

    const updates = events.filter(event => event.type === 'update')

    if (updates.length > 0) {
      await Promise.all(
        updates.map(event =>
          db.collection(event.obj + 's').updateOne(
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

    const securityTransactions = events.filter(
      event => event.obj === 'securityTransaction'
    )

    if (securityTransactions.length > 0) {
      await db.collection('securityBalances').insertMany(
        securityTransactions.map(event => {
          return {
            _id: event.objId,
            createdAt: event.timestamp,
            ...event.payload,
          }
        })
      )
    }

    console.log('')
  }

  await disconnect()
}

main()
