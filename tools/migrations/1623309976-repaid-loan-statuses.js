const yargs = require('yargs/yargs')
const moment = require('moment-timezone')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')

const { getDatabaseConnection, disconnect } = require('./../client')

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

  const loans = await db.collection('loans').find().toArray()

  let i = 1

  const loansToUpdate = loans.filter(loan => {
    const amount = loan.approvedAmount

    const disbursedAmount = amount + amount * (loan.interestRate / 100)

    const realizedAmount = loan.installments?.reduce(
      (acc, installment) => acc + installment.realization,
      0
    )

    if (disbursedAmount === realizedAmount && loan.status !== 'repaid') {
      console.log('')
      console.log(i + '. Loan', loan._id)
      console.table(loan.installments)
      i++
    }

    return disbursedAmount === realizedAmount && loan.status !== 'repaid'
  })

  if (loansToUpdate.length) {
    await db.collection('events').insertMany(
      loansToUpdate.map(loan => {
        return {
          type: 'update',
          obj: 'loan',
          objId: loan._id,
          payload: {
            status: 'repaid',
          },
          timestamp: new Date(),
          migration: '1623309976-repaid-loan-statuses',
        }
      })
    )

    console.log('')
    console.log('Statuses updated')
  } else {
    console.log('No loans to update')
  }

  await disconnect()
}

main()
