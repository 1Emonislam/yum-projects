const moment = require('moment')
const bson = require('bson')
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

  const wakisoBranch = await db
    .collection('branches')
    .find({ name: 'Wakiso' })
    .next()

  const godsLoveClientGroup = await db
    .collection('clientGroups')
    .find({ name: 'Gods Love', branchId: wakisoBranch._id })
    .next()

  let events = []

  // Nansubuga Lilian

  const client = await db
    .collection('clients')
    .find({ lastName: 'Nansubuga', firstName: 'Lilian' })
    .next()

  events.push({
    type: 'update',
    obj: 'client',
    objId: client._id,
    payload: {
      clientGroupId: godsLoveClientGroup._id,
    },
    timestamp: new Date(),
    migration: '1626853893-fix-clients-from-gods-love-group.js',
  })

  // Duplicates

  const clients = await db
    .collection('clients')
    .find({
      clientGroupId: { $ne: godsLoveClientGroup._id },
      $or: [
        { lastName: 'Nalubowa', firstName: 'Aisha' },
        { lastName: 'Nalubega', firstName: 'Fatuma' },
        { lastName: 'Nattu', firstName: 'Sylivia' },
        { lastName: 'Babirye', firstName: 'Florence' },
      ],
    })
    .toArray()

  clients.forEach(client => {
    events.push({
      type: 'delete',
      obj: 'client',
      objId: client._id,
      timestamp: new Date(),
      migration: '1626853893-fix-clients-from-gods-love-group.js',
    })

    client.loans.forEach(loan => {
      events.push({
        type: 'delete',
        obj: 'loan',
        objId: loan,
        timestamp: new Date(),
        migration: '1626853893-fix-clients-from-gods-love-group.js',
      })
    })
  })

  console.log(events)

  console.log('')

  console.log('Inserting…')

  await db.collection('events').insertMany(events)

  await disconnect()
}

main()
