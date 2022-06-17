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

const objMap = {
  user: 'users',
  branch: 'branches',
  cashAtHandForm: 'cashAtHandForms',
  client: 'clients',
  clientGroup: 'clientGroups',
  form: 'forms',
  holiday: 'holidays',
  loanProduct: 'loanProducts',
  loan: 'loans',
  setting: 'settings',
  feedback: 'feedback',
  clientGroupMeeting: 'clientGroupsMeetings',
}

const main = async () => {
  if (!argv.env) {
    console.log()
    console.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  // const db = await getDatabaseConnection(argv.env)

  const a = new ObjectId()
  const b = new ObjectId()

  console.log(a.toString(), a.getTimestamp(), b.toString(), b.getTimestamp())
  process.exit()

  // let i = 0
  // while (i < 42700) {
  //   // const response = await redis.blpop('queue:events', 1)
  //   const response = await redis.lrange('queue:events', i, i)
  //   // const event = JSON.parse(response[1])
  //   const event = JSON.parse(response)
  //   // console.log(event)

  //   if (event.type === 'create') {
  //     await db.collection(objMap[event.obj]).insertOne({
  //       _id: ObjectId(event.objId),
  //       createdAt: event.timestamp,
  //       updatedAt: event.timestamp,
  //       ...event.payload,
  //     })
  //   }

  //   if (event.type === 'update') {
  //     const existing = await db.collection(objMap[event.obj]).findOne({
  //       _id: ObjectId(event.objId),
  //     })

  //     if (!existing) {
  //       throw new Error('Entity not found')
  //     }

  //     await db.collection(objMap[event.obj]).updateOne(
  //       {
  //         _id: ObjectId(event.objId),
  //       },
  //       {
  //         $set: {
  //           ..._.omit(event.payload, ['_id', 'createdAt']),
  //           updatedAt: event.timestamp,
  //         },
  //       }
  //     )
  //   }

  //   if (event.type === 'delete') {
  //     const existing = await db.collection(objMap[event.obj]).findOne({
  //       _id: ObjectId(event.objId),
  //     })

  //     if (!existing) {
  //       throw new Error('Entity not found')
  //     }

  //     await db.collection(objMap[event.obj]).deleteOne({
  //       _id: ObjectId(event.objId),
  //     })
  //   }

  //   console.log('Processed', i)
  //   i += 1
  // }

  // disconnect()
  // redis.quit()
}

main()
