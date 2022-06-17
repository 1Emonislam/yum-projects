const _ = require('lodash')
const { getDatabaseConnection, disconnect } = require('./../client')
const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const fs = require('fs')
const yargs = require('yargs/yargs')

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

  let events = []

  console.log('Adding new loan products…')

  events.push({
    _id: new ObjectId(),
    type: 'create',
    obj: 'loanProduct',
    objId: new ObjectId(),
    payload: {
      name: 'Monthly Loan',
      gracePeriods: [
        {
          durationValue: 4,
          durationUnit: 'week',
          gracePeriodDays: 5,
        },
      ],
      cashCollateral: {
        initialLoan: 10,
        furtherLoans: 15,
      },
      loanInsurance: 1,
      firstLoanDisbursement: 14,
      riskCover: 'LOP will be closed and member savings returned',
      disbursement: 'TBD',
      disbursementAllowCheques: false,
      loanProcessingFee: {
        type: 'percentage',
        value: 1,
      },
      durations: {
        weekly: [4],
      },
      initialLoan: [
        {
          durationValue: 4,
          durationUnit: 'week',
          from: 100000,
          to: 200000,
        },
      ],
      loanIncrementEachCycle: [
        {
          durationValue: 4,
          durationUnit: 'week',
          from: 50000,
          to: 100000,
        },
      ],
      serviceCharges: [
        {
          durationValue: 4,
          durationUnit: 'week',
          charge: 3,
        },
      ],
      advanceInstallments: [
        {
          durationValue: 4,
          durationUnit: 'week',
          installments: 2,
        },
      ],
      limits: [
        {
          durationValue: 4,
          durationUnit: 'week',
          limit: 10000000,
        },
      ],
      requiredGuarantors: {
        group: 1,
        family: 1,
      },
      requiredDocuments: {
        initialLoan: [
          {
            _id: new ObjectId(),
            name: 'Local Council certificate',
          },
        ],
        furtherLoans: [],
      },
      status: 'active',
    },
    timestamp: new Date(),
    migration: '1642402503-product-financing-loan.js',
  })

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Log

  // fs.writeFile(
  //   './1642402503-monthly-loan.json',
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

    await db.collection('loanProducts').insertMany(
      events.map(loanProduct => {
        return {
          _id: loanProduct.objId,
          createdAt: loanProduct.timestamp,
          updatedAt: loanProduct.timestamp,
          ...loanProduct.payload,
        }
      })
    )

    console.log('')
  }

  await disconnect()
}

main()
