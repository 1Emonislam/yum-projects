const fs = require('fs')
const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { getDatabaseConnection, disconnect } = require('./client')
const _ = require('lodash')
const MongoDB = require('mongodb')
const redis = require('./redisClient')

const argv = yargs(hideBin(process.argv)).argv

const { ObjectId } = MongoDB

const main = async () => {
  if (!argv.env) {
    console.log()
    console.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const cursor = db.collection('events').find({}).sort({ _id: 1 })

  cursor
    .stream()
    .on('data', async data => {
      const r = await redis.rpush('queue:events', JSON.stringify(data))
      console.log('r', r)
    })
    .on('end', () => {
      disconnect()
      redis.quit()
    })
}

main()
