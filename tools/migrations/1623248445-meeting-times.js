const yargs = require('yargs/yargs')
const moment = require('moment-timezone')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')

const { getDatabaseConnection, disconnect } = require('./../client')

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

  await db.collection('events').insertMany(
    clientGroups
      .filter(clientGroup => clientGroup.meeting.time.includes('pm'))
      .map(clientGroup => {
        return {
          type: 'update',
          obj: 'clientGroup',
          objId: clientGroup._id,
          payload: {
            meeting: {
              time: clientGroup.meeting.time
                .replace('1:00pm', '13:00')
                .replace('pm', ''),
            },
          },
          timestamp: new Date(),
          migration: '1623248445-meeting-times.js',
        }
      })
  )

  await disconnect()
}

main()
