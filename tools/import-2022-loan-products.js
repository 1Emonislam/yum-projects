const _ = require('lodash')
const { getDatabaseConnection, disconnect } = require('./client')
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

  const loanProducts = await db.collection('loanProducts').find().toArray()

  const areNewLoanProductsImported = loanProducts.some(
    product => product.name === 'Small Business Loan 2022'
  )

  if (areNewLoanProductsImported) {
    console.log('New loan products are already added to this environment')

    process.exit()
  }

  const timestamp = new Date()

  let events = []

  // Loan products

  console.log('Adding new loan products…')

  // Small Loan 2022

  events.push({
    _id: new ObjectId(),
    type: 'create',
    obj: 'loanProduct',
    objId: new ObjectId(),
    payload: {
      name: 'Small Loan 2022',
      gracePeriods: [
        {
          durationValue: 11,
          durationUnit: 'week',
          gracePeriodDays: 5,
        },
        {
          durationValue: 16,
          durationUnit: 'week',
          gracePeriodDays: 5,
        },
        {
          durationValue: 19,
          durationUnit: 'week',
          gracePeriodDays: 5,
        },
        {
          durationValue: 23,
          durationUnit: 'week',
          gracePeriodDays: 5,
        },
        {
          durationValue: 42,
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
      riskCover: 'LOP will be written-off and member savings will be returned',
      disbursement: 'Cash disbursement from branch',
      disbursementAllowCheques: false,
      loanProcessingFee: {
        type: 'percentage',
        value: 1,
      },
      durations: {
        weekly: [11, 16, 19, 23, 42],
      },
      initialLoan: [
        {
          durationValue: 11,
          durationUnit: 'week',
          from: 250000,
          to: 600000,
        },
        {
          durationValue: 16,
          durationUnit: 'week',
          from: 250000,
          to: 600000,
        },
        {
          durationValue: 19,
          durationUnit: 'week',
          from: 250000,
          to: 600000,
        },
        {
          durationValue: 23,
          durationUnit: 'week',
          from: 250000,
          to: 800000,
        },
        {
          durationValue: 42,
          durationUnit: 'week',
          from: 250000,
          to: 800000,
        },
      ],
      loanIncrementEachCycle: [
        {
          durationValue: 11,
          durationUnit: 'week',
          from: 100000,
          to: 200000,
        },
        {
          durationValue: 16,
          durationUnit: 'week',
          from: 100000,
          to: 200000,
        },
        {
          durationValue: 19,
          durationUnit: 'week',
          from: 100000,
          to: 200000,
        },
        {
          durationValue: 23,
          durationUnit: 'week',
          from: 100000,
          to: 200000,
        },
        {
          durationValue: 42,
          durationUnit: 'week',
          from: 100000,
          to: 200000,
        },
      ],
      serviceCharges: [
        {
          durationValue: 11,
          durationUnit: 'week',
          charge: 10,
        },
        {
          durationValue: 16,
          durationUnit: 'week',
          charge: 12,
        },
        {
          durationValue: 19,
          durationUnit: 'week',
          charge: 14,
        },
        {
          durationValue: 23,
          durationUnit: 'week',
          charge: 15,
        },
        {
          durationValue: 42,
          durationUnit: 'week',
          charge: 26,
        },
      ],
      advanceInstallments: [
        {
          durationValue: 11,
          durationUnit: 'week',
          installments: 2,
        },
        {
          durationValue: 16,
          durationUnit: 'week',
          installments: 3,
        },
        {
          durationValue: 19,
          durationUnit: 'week',
          installments: 4,
        },
        {
          durationValue: 23,
          durationUnit: 'week',
          installments: 5,
        },
        {
          durationValue: 42,
          durationUnit: 'week',
          installments: 7,
        },
      ],
      limits: [
        {
          durationValue: 11,
          durationUnit: 'week',
          limit: 1500000,
        },
        {
          durationValue: 16,
          durationUnit: 'week',
          limit: 1500000,
        },
        {
          durationValue: 19,
          durationUnit: 'week',
          limit: 2500000,
        },
        {
          durationValue: 23,
          durationUnit: 'week',
          limit: 2500000,
        },
        {
          durationValue: 42,
          durationUnit: 'week',
          limit: 2500000,
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
    timestamp,
    migration: 'import-2022-loan-products.js',
  })

  // Small Business Loan 2022

  events.push({
    _id: new ObjectId(),
    type: 'create',
    obj: 'loanProduct',
    objId: new ObjectId(),
    payload: {
      name: 'Small Business Loan 2022',
      gracePeriods: [
        {
          durationValue: 23,
          durationUnit: 'week',
          gracePeriodDays: 5,
        },
        {
          durationValue: 12,
          durationUnit: 'twoWeeks',
          gracePeriodDays: 10,
        },
        {
          durationValue: 42,
          durationUnit: 'week',
          gracePeriodDays: 5,
        },
        {
          durationValue: 21,
          durationUnit: 'twoWeeks',
          gracePeriodDays: 10,
        },
      ],
      cashCollateral: {
        initialLoan: 15,
        furtherLoans: 20,
      },
      loanInsurance: 1,
      firstLoanDisbursement: 14,
      riskCover: 'LOP will be written-off and member savings will be returned',
      disbursement:
        'Up to 2,000,000 Ugx Cash disbursement from branch. For more than 2,000,000 Ugx cheque payment',
      disbursementAllowCheques: true,
      loanProcessingFee: {
        type: 'percentage',
        value: 1,
      },
      durations: {
        weekly: [23, 42],
        biweekly: [12, 21],
      },
      initialLoan: [
        {
          durationValue: 23,
          durationUnit: 'week',
          from: 1500000,
          to: 5000000,
        },
        {
          durationValue: 12,
          durationUnit: 'twoWeeks',
          from: 1500000,
          to: 5000000,
        },
        {
          durationValue: 42,
          durationUnit: 'week',
          from: 1500000,
          to: 5000000,
        },
        {
          durationValue: 21,
          durationUnit: 'twoWeeks',
          from: 1500000,
          to: 5000000,
        },
      ],
      loanIncrementEachCycle: [
        {
          durationValue: 23,
          durationUnit: 'week',
          from: 300000,
          to: 500000,
        },
        {
          durationValue: 12,
          durationUnit: 'twoWeeks',
          from: 300000,
          to: 500000,
        },
        {
          durationValue: 42,
          durationUnit: 'week',
          from: 300000,
          to: 500000,
        },
        {
          durationValue: 21,
          durationUnit: 'twoWeeks',
          from: 300000,
          to: 500000,
        },
      ],
      serviceCharges: [
        {
          durationValue: 23,
          durationUnit: 'week',
          charge: 15,
        },
        {
          durationValue: 12,
          durationUnit: 'twoWeeks',
          charge: 15,
        },
        {
          durationValue: 42,
          durationUnit: 'week',
          charge: 26,
        },
        {
          durationValue: 21,
          durationUnit: 'twoWeeks',
          charge: 26,
        },
      ],
      advanceInstallments: [
        {
          durationValue: 23,
          durationUnit: 'week',
          installments: 5,
        },
        {
          durationValue: 12,
          durationUnit: 'twoWeeks',
          installments: 5,
        },
        {
          durationValue: 42,
          durationUnit: 'week',
          installments: 7,
        },
        {
          durationValue: 21,
          durationUnit: 'twoWeeks',
          installments: 7,
        },
      ],
      limits: [
        {
          durationValue: 23,
          durationUnit: 'week',
          limit: 10000000,
        },
        {
          durationValue: 12,
          durationUnit: 'twoWeeks',
          limit: 10000000,
        },
        {
          durationValue: 42,
          durationUnit: 'week',
          limit: 10000000,
        },
        {
          durationValue: 21,
          durationUnit: 'twoWeeks',
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
          {
            _id: new ObjectId(),
            name: 'Business license or valid business document',
          },
        ],
        furtherLoans: [],
      },
      status: 'active',
    },
    timestamp,
    migration: 'import-2022-loan-products.js',
  })

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Log

  // fs.writeFile(
  //   './import-2022-loan-products.json',
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
      events
        .filter(event => event.type === 'create' && event.obj === 'loanProduct')
        .map(loanProduct => {
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
