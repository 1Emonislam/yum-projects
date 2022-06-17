const { ObjectId } = require('mongodb')

const resolvers = {
  holiday: async (_, { query: { _id } }, { dataSources }) => {
    return dataSources.holidays.collection.findOne({
      _id: ObjectId(_id),
    })
  },
  holidays: async (_, __, { dataSources }) => {
    return dataSources.holidays.collection.find().toArray()
  },
}

module.exports = resolvers
