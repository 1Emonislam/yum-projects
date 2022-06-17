const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')

const { getDatabaseConnection, disconnect, ObjectId } = require('./client')

const argv = yargs(hideBin(process.argv)).argv

argv.env = 'yam-staging'

const interactive = new Signale({ interactive: true, scope: 'yolo' })

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const eventsToCheck = []
  const logs = []

  const id = '60f80d7ed2cbd5f4b3f205fb'

  eventsToCheck.push({ $oid: id })

  try {
    for (let i = 0; i < 250; i++) {
      console.log('Finding events', i)
      console.log({ _id: { $in: eventsToCheck.map(event => event.$oid) } })
      const ids = await db
        .collection('events')
        .find({
          _id: { $in: eventsToCheck.map(event => new ObjectId(event.$oid)) },
        })
        .toArray()

      console.log('---', ids, ids.length, eventsToCheck.length)

      if (ids.length === eventsToCheck.length) {
        console.log('All events found after', i, 'iteration')
        logs.push('All events found after', i, 'iteration', new Date())
        break
      }

      await new Promise(resolve => setTimeout(resolve, 150))
    }
  } catch (error) {
    console.error(error)
    logs.push(['Caught error when waiting for events', error])
  }

  console.log('Done.')
  console.log(logs)

  await disconnect()
}

main()
