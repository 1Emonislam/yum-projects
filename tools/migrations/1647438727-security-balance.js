const _ = require('lodash')
const { getDatabaseConnection, disconnect } = require('./../client')
const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const fs = require('fs')
const path = require('path')
const yargs = require('yargs/yargs')
const { readCsv } = require('./../csv')

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

const timestamp = new Date()

const migration = path.parse(__filename).name

const filesWithDataToImport = [
  'import-2022-03-14.csv',
  'import-2022-03-11.csv',
  'import-2022-03-08.csv',
  'import-2022-02-28.csv',
  'import-2022-02-22.csv',
]

const filesWithClientsToIgnore = [
  'import-initial-security-2022-03-14.csv',
  'import-initial-security-2022-03-16.csv',
]

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  // Get clients from the database

  const clients = await db
    .collection('events')
    .find({
      $or: filesWithDataToImport.map(file => {
        return {
          obj: 'client',
          importNotes: {
            $regex: file,
          },
        }
      }),
    })
    .toArray()

  // Load the import files

  const rows = []

  await Promise.all(
    filesWithDataToImport.map(async file => {
      const { data } = readCsv(file, true)

      data.forEach(row => rows.push({ ...row, file: file }))
    })
  )

  // Load the files with clients to ignore

  const ignore = []

  await Promise.all(
    filesWithClientsToIgnore.map(async file => {
      const { data } = readCsv(file, true)

      data.forEach(row => ignore.push(row['client id']))
    })
  )

  // Match the clients from the database with the data from the import files

  const data = rows.map(row => {
    const ctx = clients.find(
      event =>
        String(event.payload.firstName).toLowerCase().trim() ===
          String(
            [
              String(row['member first name']).toLowerCase().trim(),
              String(row['member middle name']).toLowerCase().trim(),
            ].join(' ')
          ).trim() &&
        String(event.payload.lastName).toLowerCase().trim() ===
          String(row['member last name']).toLowerCase().trim()
    )

    if (!ctx) {
      console.log(row)

      process.exit()
    }

    row.dbId = ctx.objId
    row.dbClientGroupId = ctx.payload.clientGroupId
    row.dbSecurityBalance = ctx.payload.securityBalance
    row.dbTimestamp = ctx.timestamp

    return row
  })

  // console.table(
  //   data.map(item => {
  //     return {
  //       ID: item.dbId,
  //       'Security balance (file)': Number(
  //         String(item['security balance']).replaceAll(' ', '')
  //       ),
  //       'Security balance (database)': item.dbSecurityBalance,
  //     }
  //   })
  // )

  // Find the clients with differences

  const clientsToUpdate = data.filter(
    item =>
      Number(String(item['security balance']).replaceAll(' ', '')) !==
        item.dbSecurityBalance && !ignore.includes(String(item.dbId))
  )

  const clientGroups = await db
    .collection('clientGroups')
    .find(
      {
        _id: { $in: clientsToUpdate.map(client => client.dbClientGroupId) },
      },
      {
        _id: 1,
        branchId: 1,
      }
    )
    .toArray()

  // console.table(
  //   clientsToUpdate.map(item => {
  //     return {
  //       ID: item.dbId,
  //       'Security balance (file)': Number(
  //         String(item['security balance']).replaceAll(' ', '')
  //       ),
  //       'Security balance (database)': item.dbSecurityBalance,
  //     }
  //   })
  // )

  const events = []

  for (let [index, client] of clientsToUpdate.entries()) {
    console.log(
      `Client ${index + 1}/${clientsToUpdate.length} (${client.dbId})…`
    )

    const securityBalance = Number(
      String(client['security balance']).replaceAll(' ', '')
    )

    const branchId = clientGroups.find(
      clientGroup => String(clientGroup._id) === String(client.dbClientGroupId)
    ).branchId

    events.push({
      _id: new ObjectId(),
      type: 'update',
      obj: 'client',
      objId: client.dbId,
      payload: {
        securityBalance,
      },
      timestamp,
      migration,
    })

    events.push({
      _id: new ObjectId(),
      type: 'create',
      obj: 'securityTransaction',
      objId: new ObjectId(),
      payload: {
        branchId,
        clientId: client.dbId,
        comment: 'The initial security balance',
        openingSecurityBalance: 0,
        closingSecurityBalance: securityBalance,
        change: securityBalance,
        date: client.dbTimestamp,
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

    console.log('')
  }

  await disconnect()
}

main()
