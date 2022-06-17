const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const JSON5 = require('json5')
const { ObjectId } = require('mongodb')

const argv = yargs(hideBin(process.argv)).argv

function main() {
  const timestamp = new Date()

  const event = {
    type: argv.type || '______',
    obj: argv.obj || '______',
    objId: argv.objId || argv.generateOid ? new ObjectId() : '______',
    payload: JSON5.parse(argv.payload || '{}'),
    timestamp,
    importedAt: timestamp,
    importNotes: argv.importNotes,
  }

  if (argv.mongodb) {
    event.objId = { $oid: event.objId }
    event.timestamp = { $date: event.timestamp }
    event.importedAt = { $date: event.importedAt }
  }

  if (argv.autoTimestamps) {
    if (event.type === 'create') {
      event.payload.createdAt = { $date: timestamp }
    }

    event.payload.updatedAt = { $date: timestamp }
  }

  console.log(JSON.stringify(event, null, 2))
}

main()
