const fs = require('fs')
const lodash = require('lodash')
const yargs = require('yargs/yargs')
const path = require('path')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')
const { ObjectId } = require('mongodb')

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

  if (!argv.from) {
    console.log()
    interactive.error('Please specify --from <phone number>')
    console.log()
    process.exit(1)
  }

  if (!argv.to) {
    console.log()
    interactive.error('Please specify --to <phone number>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const from = await db.collection('users').findOne({
    fullPhoneNumber: argv.from,
    role: 'loanOfficer',
  })

  if (!from) {
    console.log()
    interactive.error(
      'Please specify --from <phone number> (valid phone number existing in the database)'
    )
    console.log()
    process.exit(1)
  }

  const to = await db.collection('users').findOne({
    fullPhoneNumber: argv.to,
    role: 'loanOfficer',
    branchId: from.branchId,
  })

  if (!to) {
    console.log()
    interactive.error(
      'Please specify --to <phone number> (valid phone number existing in the database from the same branch as --from)'
    )
    console.log()
    process.exit(1)
  }

  const clientGroups = await db
    .collection('clientGroups')
    .find({
      loanOfficerId: from._id,
    })
    .toArray()

  let events = []

  if (clientGroups.length > 0) {
    console.log(' ')
    console.log('Groups to move:')
  }

  for (let [index, clientGroup] of clientGroups.entries()) {
    console.log(
      `${index + 1}/${clientGroups.length} https://app.yamafrica.com/groups/${
        clientGroup._id
      }`
    )

    events.push({
      _id: new ObjectId(),
      type: 'update',
      obj: 'clientGroup',
      objId: clientGroup._id,
      payload: {
        loanOfficerId: to._id,
      },
      timestamp,
      migration,
    })
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
    console.log('Saving…')

    await db.collection('events').insertMany(events)

    await Promise.all(
      events.map(event =>
        db.collection(event.obj + 's').updateOne(
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
