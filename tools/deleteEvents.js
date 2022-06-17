const fs = require('fs')
const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { getDatabaseConnection, disconnect } = require('./client')
const _ = require('lodash')
const MongoDB = require('mongodb')

const argv = yargs(hideBin(process.argv)).argv

const { ObjectId } = MongoDB

const deleteEvents = async () => {
  if (!argv.env) {
    console.log()
    console.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const file = fs
    .readFileSync(path.join(__dirname, '..', '..', 'data', 'export-2021-07-13'))
    .toString()

  const parsedLines = file
    .trim()
    .split('\n')
    .map(line => (line.length > 0 ? JSON.parse(line) : line))

  const idsToRemove = parsedLines.map(line => line._id.$oid)

  const chunks = _.chunk(idsToRemove, 100)

  try {
    for (let chunk of chunks) {
      const result = await db
        .collection('events')
        .deleteMany({ _id: { $in: chunk.map(id => new ObjectId(id)) } })

      console.log('result', result.deletedCount)
    }
  } catch (error) {
    console.error(error)
  } finally {
    await disconnect()
  }
}

deleteEvents()
