const _ = require('lodash')
const fs = require('fs')
const lodash = require('lodash')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')

const { getDatabaseConnection, disconnect } = require('./../client')
const { BSON } = require('realm')

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

  const users = await db.collection('users').find().toArray()

  const najjukoZam = users.find(
    user => user.fullPhoneNumber === '+256704307769'
  )

  const annetNabukalu = users.find(
    user => user.fullPhoneNumber === '+256702746129'
  )

  const namugerwaJosephine = users.find(
    user => user.fullPhoneNumber === '+256775131309'
  )

  const nawumanyaAlison = users.find(
    user => user.fullPhoneNumber === '+256775632111'
  )

  const clientGroups = await db
    .collection('clientGroups')
    .find({
      $or: [
        { loanOfficerId: najjukoZam._id },
        { loanOfficerId: annetNabukalu._id },
      ],
    })
    .toArray()

  let events = []

  for (let [index, clientGroup] of clientGroups.entries()) {
    console.log(
      `Client group ${index + 1}/${clientGroups.length} (${clientGroup._id})…`
    )

    const loanOfficerId =
      String(clientGroup.loanOfficerId) === String(najjukoZam._id)
        ? namugerwaJosephine._id
        : nawumanyaAlison._id

    events.push({
      _id: new BSON.ObjectId(),
      type: 'update',
      obj: 'clientGroup',
      objId: clientGroup._id,
      payload: {
        loanOfficerId,
      },
      timestamp: new Date(),
      migration:
        '1635756089-replace-loan-officers-najjuko-zam-annet-nabukalu.js',
    })
  }

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Log

  // fs.writeFile(
  //   './1635756089-replace-loan-officers-najjuko-zam-annet-nabukalu.json',
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

    await Promise.all(
      events.map(event =>
        db.collection('clientGroups').updateOne(
          { _id: event.objId },
          {
            $set: {
              ...lodash.omit(event.payload, ['_id', 'createdAt']),
              updatedAt: event.timestamp,
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
