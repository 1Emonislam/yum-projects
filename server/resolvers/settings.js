const resolvers = {
  settings: async (_, __, { dataSources }) => {
    return dataSources.settings.collection.find().toArray()
  },
}

module.exports = resolvers
