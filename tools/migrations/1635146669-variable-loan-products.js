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

  const clientGroups = await db.collection('clientGroups').find().toArray()

  const loanProducts = await db.collection('loanProducts').find().toArray()

  const loans = await db.collection('loans').find().toArray()

  const forms = await db.collection('forms').find().toArray()

  let events = []

  // Client groups

  for (let [index, clientGroup] of clientGroups.entries()) {
    console.log(
      `Client group ${index + 1}/${clientGroups.length} (${clientGroup._id})…`
    )

    if (clientGroup?.meeting?.frequency !== 'weekly') {
      events.push({
        _id: new ObjectId(),
        type: 'update',
        obj: 'clientGroup',
        objId: clientGroup._id,
        payload: {
          meeting: {
            ...clientGroup.meeting,
            frequency: 'weekly',
          },
        },
        timestamp: new Date(),
        migration: '1635146669-variable-loan-products.js',
      })
    }
  }

  // Loan products

  for (let [index, loanProduct] of loanProducts.entries()) {
    console.log(
      `Loan product ${index + 1}/${loanProducts.length} (${loanProduct._id})…`
    )

    const conditionalNameChange =
      loanProduct.name === 'Small Business Loan'
        ? { name: 'Legacy Small Business Loan', status: 'inactive' }
        : {}

    events.push({
      _id: new ObjectId(),
      type: 'update',
      obj: 'loanProduct',
      objId: loanProduct._id,
      payload: {
        advanceInstallments: loanProduct.advanceInstallments.map(
          installments => {
            return {
              durationValue: installments.duration,
              durationUnit: 'week',
              installments: installments.installments,
            }
          }
        ),
        durations: { weekly: loanProduct.durations },
        gracePeriods: loanProduct.durations.map(durationValue => {
          return {
            durationValue,
            durationUnit: 'week',
            gracePeriodDays: loanProduct.gracePeriod,
          }
        }),
        initialLoan: loanProduct.initialLoan.map(initialLoan => {
          return {
            durationValue: initialLoan.duration,
            durationUnit: 'week',
            from: initialLoan.from,
            to: initialLoan.to,
          }
        }),
        limits: loanProduct.limits.map(limit => {
          return {
            durationValue: limit.duration,
            durationUnit: 'week',
            limit: limit.limit,
          }
        }),
        loanIncrementEachCycle: loanProduct.loanIncrementEachCycle.map(
          loanIncrementEachCycle => {
            return {
              durationValue: loanIncrementEachCycle.duration,
              durationUnit: 'week',
              from: loanIncrementEachCycle.from,
              to: loanIncrementEachCycle.to,
            }
          }
        ),
        serviceCharges: loanProduct.serviceCharge.map(charge => {
          return {
            durationValue: charge.duration,
            durationUnit: 'week',
            charge: charge.charge,
          }
        }),
        disbursementAllowCheques: false,
        ...conditionalNameChange,
      },
      timestamp: new Date(),
      migration: '1635146669-variable-loan-products.js',
    })
  }

  console.log('Adding new loan products…')

  events.push({
    _id: new ObjectId(),
    type: 'create',
    obj: 'loanProduct',
    objId: new ObjectId(),
    payload: {
      name: 'Small Business Loan',
      gracePeriods: [
        {
          durationValue: 24,
          durationUnit: 'week',
          gracePeriodDays: 5,
        },
        {
          durationValue: 6,
          durationUnit: 'month',
          gracePeriodDays: 30,
        },
        {
          durationValue: 12,
          durationUnit: 'month',
          gracePeriodDays: 30,
        },
      ],
      cashCollateral: {
        initialLoan: 10,
        furtherLoans: 15,
      },
      loanInsurance: 1,
      firstLoanDisbursement: 14,
      riskCover: '100% of Loan outstanding write off',
      disbursement:
        'Cash disbursement from the branch up to Ugx 2,000,000/= and Cheque disbursement above 2,000,000/= through account pay cheque.',
      disbursementAllowCheques: true,
      loanProcessingFee: {
        type: 'percentage',
        value: 1,
      },
      durations: {
        weekly: [24],
        monthly: [6, 12],
      },
      initialLoan: [
        {
          durationValue: 24,
          durationUnit: 'week',
          from: 1500000,
          to: 5000000,
        },
        {
          durationValue: 6,
          durationUnit: 'month',
          from: 1500000,
          to: 5000000,
        },
        {
          durationValue: 12,
          durationUnit: 'month',
          from: 1500000,
          to: 5000000,
        },
      ],
      loanIncrementEachCycle: [
        {
          durationValue: 24,
          durationUnit: 'week',
          from: 300000,
          to: 1000000,
        },
        {
          durationValue: 6,
          durationUnit: 'month',
          from: 300000,
          to: 1000000,
        },
        {
          durationValue: 12,
          durationUnit: 'month',
          from: 300000,
          to: 1000000,
        },
      ],
      serviceCharges: [
        {
          durationValue: 24,
          durationUnit: 'week',
          charge: 15,
        },
        {
          durationValue: 6,
          durationUnit: 'month',
          charge: 15,
        },
        {
          durationValue: 12,
          durationUnit: 'month',
          charge: 29,
        },
      ],
      advanceInstallments: [
        {
          durationValue: 24,
          durationUnit: 'week',
          installments: 3,
        },
        {
          durationValue: 6,
          durationUnit: 'month',
          installments: 1,
        },
        {
          durationValue: 12,
          durationUnit: 'month',
          installments: 2,
        },
      ],
      limits: [
        {
          durationValue: 24,
          durationUnit: 'week',
          limit: 10000000,
        },
        {
          durationValue: 6,
          durationUnit: 'month',
          limit: 10000000,
        },
        {
          durationValue: 12,
          durationUnit: 'month',
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
            name: 'Business license',
          },
          {
            _id: new ObjectId(),
            name: 'Valid land title, land agreement, motor vehicle card or motorcycle card',
          },
        ],
        furtherLoans: [
          {
            _id: new ObjectId(),
            name: 'Local Council certificate',
          },
          {
            _id: new ObjectId(),
            name: 'Business license',
          },
          {
            _id: new ObjectId(),
            name: 'Valid land title, land agreement, motor vehicle card or motorcycle card',
          },
        ],
      },
      status: 'active',
    },
    timestamp: new Date(),
    migration: '1635146669-variable-loan-products.js',
  })

  // Loans

  for (let [index, loan] of loans.entries()) {
    console.log(`Loan ${index + 1}/${loans.length} (${loan._id})…`)

    events.push({
      _id: new ObjectId(),
      type: 'update',
      obj: 'loan',
      objId: loan._id,
      payload: {
        duration: {
          value: loan.duration,
          unit: 'week',
        },
      },
      timestamp: new Date(),
      migration: '1635146669-variable-loan-products.js',
    })
  }

  // Forms

  for (let [index, form] of forms.entries()) {
    console.log(`Form ${index + 1}/${forms.length} (${form._id})…`)

    events.push({
      _id: new ObjectId(),
      type: 'update',
      obj: 'form',
      objId: form._id,
      payload: {
        content: {
          ...form.content,
          loan: {
            ...form.content.loan,
            duration: {
              value: form.content.loan.duration,
              unit: 'week',
            },
          },
        },
      },
      timestamp: new Date(),
      migration: '1635146669-variable-loan-products.js',
    })
  }

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Log

  // fs.writeFile(
  //   './1635146669-variable-loan-products.json',
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

    await new Promise(resolve => setTimeout(resolve, 5000))

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

    await new Promise(resolve => setTimeout(resolve, 5000))

    await Promise.all(
      events
        .filter(event => event.type === 'update')
        .map(event =>
          db.collection(event.obj + 's').updateOne(
            { _id: event.objId },
            {
              $set: {
                ..._.omit(event.payload, ['_id', 'createdAt']),
                updatedAt: event.timestamp,
              },
              $unset: {
                gracePeriod: 1,
                serviceCharge: 1,
              },
            },
            { upsert: false }
          )
        )
    )

    console.log('')
  }

  await disconnect()
}

main()
