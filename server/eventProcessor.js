const { ObjectId } = require('mongodb')
const lodash = require('lodash')
const holidaysOnUpdate = require('./resolvers/legacy/holidaysOnUpdate')

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
  securityTransaction: 'securityBalances',
}

class EventProcessor {
  constructor(context) {
    this.dataSources = context.dataSources
    this.db = context.db
    this.timezone = context.timezone
    this.user = context.user
    this.apiVersion = context.apiVersion
  }

  setUser(user) {
    this.user = user
  }

  async addEvent(input) {
    const timestamp = new Date()
    const objId = input.objId ? new ObjectId(input.objId) : new ObjectId()

    const formattedPayload = input.payload

    const event = await this.dataSources.events.collection.insertOne({
      ...input,
      payload: formattedPayload,
      objId,
      userId: new ObjectId(this?.user?._id),
      timestamp,
      apiVersion: this.apiVersion,
    })

    if (!objMap[input.obj]) {
      return {
        _id: event.insertedId,
        timestamp,
      }
    }

    if (input.type === 'create') {
      await this.dataSources[objMap[input.obj]].collection.insertOne({
        _id: objId,
        createdAt: timestamp,
        updatedAt: timestamp,
        userId: new ObjectId(this.user._id),
        ...lodash.omit(formattedPayload, ['meta']),
      })
    }

    if (input.type === 'update') {
      await this.dataSources[objMap[input.obj]].collection.updateOne(
        {
          _id: ObjectId(input.objId),
        },
        {
          $set: {
            ...lodash.omit(formattedPayload, ['_id', 'createdAt', 'meta']),
            updatedAt: timestamp,
          },
        },
        {
          upsert: false,
        }
      )
    }

    if (input.type === 'delete') {
      await this.dataSources[objMap[input.obj]].collection.deleteOne({
        _id: ObjectId(input.objId),
      })
    }

    if (input.obj === 'holiday') {
      await holidaysOnUpdate(input, this.dataSources, this)
    }

    return {
      _id: event.insertedId,
      objId,
      timestamp,
    }
  }
}

module.exports = { EventProcessor }
