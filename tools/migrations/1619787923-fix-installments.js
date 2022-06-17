// Fixes missing fields in installments in loans
const moment = require('moment')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')

const { getDatabaseConnection, disconnect } = require('./../client')

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

const fixLoan = loan => {
  const { installments = [] } = loan

  for (let installment of installments) {
    let { realization, openingBalance, status, total, due } = installment
    if (status === 'late') {
      if (realization === null) {
        installment.realization = 0
      }
      if (openingBalance === null) {
        installment.openingBalance = 0
      }
      if (installment.target) {
        installment.target = total
      }
    }

    if (moment(due).isBefore(moment())) {
      installment.status = 'late'
    }
  }

  let nextInstallment = installments.find(
    installment => installment.status === 'future'
  )
  let nextIndex = installments.findIndex(
    installment => installment.status === 'future'
  )

  if (nextIndex !== -1) {
    const sums = installments
      .filter(installment => installment.status === 'late')
      .reduce(
        (installment, acc) => {
          return {
            total: acc.total + installment.total,
            realization: acc.realization + installment.realization,
          }
        },
        { total: 0, realization: 0 }
      )
    const target = sums.total - sums.realization
    nextInstallment.target = target
    installments[nextIndex] = nextInstallment
  }

  loan.installments = installments

  return loan
}

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const loans = await db.collection('loans').find({}).toArray()

  const fixedLoans = loans.map(loan => {
    const { _id, ...payload } = fixLoan(loan)
    return {
      type: 'update',
      obj: 'loan',
      objId: _id,
      payload: payload,
      timestamp: new Date(),
      migration: '1619787923-fix-installments',
    }
  })

  await db.collection('events').insertMany(fixedLoans)
  await disconnect()
}

main()
