const _ = require('lodash')
const { MongoClient, ObjectId } = require('mongodb')
const moment = require('moment-timezone')

const tz = 'Africa/Kampala'

const overdue = async () => {
  const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  await client.connect()

  const db = client.db()

  const timestamp = new Date()

  const meta = 'cron:overdue'

  const loans = await db
    .collection('loans')
    .find({
      status: 'active',
    })
    .toArray()

  console.log('Fetched loans')

  let events = []

  loans.forEach(loan => {
    const lateInstallmentIndex = loan.installments.findIndex(
      installment =>
        installment.status === 'future' &&
        !installment.realization &&
        moment(installment.due).tz(tz).isBefore(moment().tz(tz))
    )

    const shouldUpdate = lateInstallmentIndex !== -1

    if (shouldUpdate) {
      const updatedInstallments = loan.installments.map(installment => {
        if (
          installment.status === 'future' &&
          !installment.realization &&
          moment(installment.due).tz(tz).isBefore(moment().tz(tz))
        ) {
          return {
            ...installment,
            realization: 0,
            status: 'late',
            wasLate: true,
          }
        }

        return installment
      })

      events.push({
        _id: new ObjectId(),
        type: 'update',
        obj: 'loan',
        objId: loan._id,
        payload: {
          installments: updatedInstallments,
        },
        timestamp,
        meta,
      })
    }
  })

  console.log('Processed loans')

  if (events.length > 0) {
    await db.collection('events').insertMany(events)

    console.log('Inserted events')

    console.log('Updating %d loans...', events.length)

    await Promise.all(
      events.map(event =>
        db.collection('loans').updateOne(
          { _id: event.objId },
          {
            $set: {
              ..._.omit(event.payload, ['_id', 'createdAt']),
              updatedAt: event.timestamp,
            },
          },
          { upsert: false }
        )
      )
    )

    console.log('Updated loans')
  }

  await client.close()

  return 'OK'
}

overdue()
