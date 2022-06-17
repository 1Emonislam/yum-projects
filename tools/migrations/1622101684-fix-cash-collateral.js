const yargs = require('yargs/yargs')
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

  const loanProducts = await db.collection('loanProducts').find().toArray()

  await db.collection('events').insertMany(
    loans
      .filter(loan => {
        const { cashCollateral } = loanProducts.find(
          loanProduct => String(loanProduct._id) === String(loan.loanProductId)
        )

        const expectedCashCollateral =
          Number(loan.cycle) === 1
            ? cashCollateral.initialLoan
            : cashCollateral.furtherLoans

        return loan.cashCollateral !== expectedCashCollateral
      })
      .map(loan => {
        const { cashCollateral } = loanProducts.find(
          loanProduct => String(loanProduct._id) === String(loan.loanProductId)
        )

        return {
          type: 'update',
          obj: 'loan',
          objId: loan._id,
          payload: {
            cashCollateral:
              Number(loan.cycle) === 1
                ? cashCollateral.initialLoan
                : cashCollateral.furtherLoans,
          },
          timestamp: new Date(),
          migration: '1622101684-fix-cash-collateral',
        }
      })
  )

  await disconnect()
}

main()
