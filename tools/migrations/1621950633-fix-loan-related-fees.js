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
    loans.map(loan => {
      const { loanInsurance, loanProcessingFee } = loanProducts.find(
        loanProduct => String(loanProduct._id) === String(loan.loanProductId)
      )

      return {
        type: 'update',
        obj: 'loan',
        objId: loan._id,
        payload: {
          loanInsurance,
          loanProcessingFee,
        },
        timestamp: new Date(),
        migration: '1621950633-fix-loan-related-fees',
      }
    })
  )

  await disconnect()
}

main()
