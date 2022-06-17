const { ObjectId } = require('mongodb')
const { sendSMSTextMessage } = require('../services/AfricasTalking')
const { UserInputError } = require('apollo-server-fastify')
const bcrypt = require('bcrypt')
const { ForbiddenError } = require('apollo-server-fastify')

const resolvers = {
  branchManagerId: async (parent, _, { dataSources }) => {
    return dataSources.users.collection.findOne({
      _id: parent.branchManagerId,
    })
  },
  loanOfficerId: async (parent, _, { dataSources }) => {
    return dataSources.users.collection.findOne({
      _id: parent.loanOfficerId,
    })
  },
  user: async (_, { query: { _id } }, { dataSources }) => {
    return dataSources.users.collection.findOne({
      _id: ObjectId(_id),
    })
  },
  users: async (_, { query: { branchId, role } }, { dataSources, user }) => {
    if (
      !['branchManager', 'admin', 'areaManager', 'regionalManager'].includes(
        user.role
      )
    ) {
      throw new ForbiddenError('Invalid user role')
    }

    return dataSources.users.collection
      .find({
        branchId: user.role === 'admin' ? ObjectId(branchId) : user.branchId,
        role,
      })
      .toArray()
  },
  userId: async (parent, _, { dataSources }) => {
    return dataSources.users.collection.findOne({
      _id: parent.userId,
    })
  },
  changePassword: async (_, argv, { eventProcessor, user }) => {
    const { passwordCurrent, passwordNew } = argv?.input

    const isSuccessful = await bcrypt.compare(passwordCurrent, user?.password)

    if (!isSuccessful) {
      throw new UserInputError('Incorrect current password', {
        argumentName: 'passwordCurrent',
      })
    }

    const passwordHash = await bcrypt.hash(passwordNew, 10)

    const passwordChangeEvent = {
      type: 'update',
      obj: 'user',
      objId: user._id,
      payload: {
        password: passwordHash,
      },
      timestamp: new Date(),
    }

    await eventProcessor.addEvent(passwordChangeEvent)

    sendSMSTextMessage(
      user.fullPhoneNumber,
      `Someone changed your Yam password. Wasn't you? Please contact admin.`
    )

    return { status: true }
  },
}

module.exports = resolvers
