const _ = require('lodash')
const { getDatabaseConnection, disconnect } = require('./client')
const { hideBin } = require('yargs/helpers')
const { readCsv } = require('./csv')
const { Signale } = require('signale')
const chalk = require('chalk')
const MongoDB = require('mongodb')
const yamrc = require('shared/yamrc')
const yargs = require('yargs/yargs')

const { ObjectId } = MongoDB

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

const timestamp = new Date()

const migration = 'import-initial-security --file ' + argv.file

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  if (
    yamrc.currentRealmApp.isProtected &&
    (!argv.force || argv.force.toLowerCase() !== 'imreallyreallysure')
  ) {
    console.log()
    interactive.error(
      'Please use --force=ImReallyReallySure in order to seed a protected environment'
    )
    console.log()
    process.exit(1)
  }

  const { data: securityTransactions } = readCsv()

  if (yamrc.currentRealmApp.isProtected) {
    console.log()
    console.log()
    console.log(chalk.bgRed('                                      '))
    console.log(chalk.bgRed('                                      '))
    console.log(chalk.bgRed('             DANGER ZONE              '))
    console.log(chalk.bgRed('                                      '))
    console.log(chalk.bgRed('                                      '))
    console.log()
    console.log()
    const msg = `Seeding protected environment ${argv.env} in %d`
    await new Promise(r => {
      interactive.await(msg, 5)
      setTimeout(() => {
        interactive.await(msg, 4)
        setTimeout(() => {
          interactive.await(msg, 3)
          setTimeout(() => {
            interactive.await(msg, 2)
            setTimeout(() => {
              interactive.await(msg, 1)
              setTimeout(() => {
                interactive.await(msg, 0)
                setTimeout(() => {
                  r()
                }, 1000)
              }, 1000)
            }, 1000)
          }, 1000)
        }, 1000)
      }, 1000)
    })
  }

  const db = await getDatabaseConnection(argv.env)

  const events = []

  const clients = await db
    .collection('clients')
    .find({
      _id: {
        $in: securityTransactions.map(transaction =>
          ObjectId(transaction['client id'])
        ),
      },
    })
    .toArray()

  const clientGroups = await db.collection('clientGroups').find().toArray()

  securityTransactions.forEach(transaction => {
    const clientId = ObjectId(transaction['client id'])

    const client = clients.find(c => String(c._id) === transaction['client id'])

    const closingSecurityBalance = Number(transaction.security)

    events.push({
      _id: new ObjectId(),
      type: 'create',
      obj: 'securityTransaction',
      objId: clientId,
      payload: {
        branchId: clientGroups.find(
          clientGroup =>
            String(clientGroup._id) === String(client.clientGroupId)
        )._id,
        clientId: clientId,
        comment:
          'The initial security balance value added to Yam most probably via Freshdesk',
        openingSecurityBalance: 0,
        closingSecurityBalance,
        change: closingSecurityBalance,
        date: timestamp,
      },
      timestamp,
      migration,
    })

    events.push({
      _id: new ObjectId(),
      type: 'update',
      obj: 'client',
      objId: clientId,
      payload: {
        securityBalance: closingSecurityBalance,
      },
      timestamp,
      migration,
    })
  })

  if (events.length > 0) {
    console.log('Inserting…')

    await db.collection('events').insertMany(events)

    await Promise.all(
      events
        .filter(event => event.obj === 'client')
        .map(event =>
          db.collection('clients').updateOne(
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

    await db.collection('securityBalances').insertMany(
      events
        .filter(event => event.obj === 'securityTransaction')
        .map(event => {
          return {
            _id: event.objId,
            createdAt: event.timestamp,
            ...event.payload,
          }
        })
    )
  }

  await disconnect()
}

main()
