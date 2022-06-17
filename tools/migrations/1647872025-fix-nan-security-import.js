const { getDatabaseConnection, disconnect } = require('./../client')
const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')

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

  const securityEvents = await db
    .collection('events')
    .find({
      importId: ObjectId('62386d6258761ae36ac497d3'),
      obj: 'securityTransaction',
      'payload.change': NaN,
    })
    .toArray()

  const clientEvents = await db
    .collection('events')
    .find({
      importId: ObjectId('62386d6258761ae36ac497d3'),
      obj: 'client',
      'payload.securityBalance': NaN,
    })
    .toArray()

  console.log(
    'security events',
    {
      _id: { $in: securityEvents.map(e => e._id) },
    },
    {
      $set: {
        'payload.change': 0,
        'payload.closingSecurityBalance': 0,
        'payload.date': securityEvents[0].timestamp,
      },
    }
  )

  console.log(
    'security objects',
    {
      clientId: { $in: securityEvents.map(e => e.payload.clientId) },
    },
    {
      $set: {
        change: 0,
        closingSecurityBalance: 0,
        date: securityEvents[0].timestamp,
      },
    }
  )

  console.log(
    'client events',
    {
      _id: { $in: clientEvents.map(e => e._id) },
    },
    { $set: { 'payload.securityBalance': 0 } }
  )

  console.log(
    'client objects',
    {
      _id: { $in: clientEvents.map(e => e.objId) },
    },
    { $set: { securityBalance: 0 } }
  )

  const securityEventsResult = await db.collection('events').updateMany(
    {
      _id: { $in: securityEvents.map(e => e._id) },
    },
    {
      $set: {
        'payload.change': 0,
        'payload.closingSecurityBalance': 0,
        'payload.date': securityEvents[0].timestamp,
      },
    }
  )

  const balancesResult = await db.collection('securityBalances').updateMany(
    // finding via clientId because we can't rely on event's objId
    { clientId: { $in: securityEvents.map(e => e.payload.clientId) } },
    {
      $set: {
        change: 0,
        closingSecurityBalance: 0,
        date: securityEvents[0].timestamp,
      },
    }
  )

  const clientEventsResult = await db.collection('events').updateMany(
    {
      _id: { $in: clientEvents.map(e => e._id) },
    },
    { $set: { 'payload.securityBalance': 0 } }
  )

  const clientsResult = await db
    .collection('clients')
    .updateMany(
      { _id: { $in: clientEvents.map(e => e.objId) } },
      { $set: { securityBalance: 0 } }
    )

  console.dir(securityEventsResult)
  console.dir(balancesResult)
  console.dir(clientEventsResult)
  console.dir(clientsResult)

  await disconnect()
}

main()
