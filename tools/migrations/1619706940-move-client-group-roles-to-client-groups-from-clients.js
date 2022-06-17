const yargs = require('yargs/yargs')
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

  const clients = await db
    .collection('clients')
    .find({ role: { $in: ['president', 'secretary', 'cashier'] } })
    .toArray()

  await db.collection('events').insertMany(
    clients.map(client => {
      const payload = {
        [client.role + 'Id']: client._id,
      }

      return {
        type: 'update',
        obj: 'clientGroup',
        objId: client.clientGroupId,
        payload: payload,
        timestamp: new Date(),
        migration:
          '1619706940-move-client-group-roles-to-client-groups-from-clients',
      }
    })
  )

  await disconnect()
}

main()
