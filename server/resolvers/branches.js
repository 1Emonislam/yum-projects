const { ObjectId } = require('mongodb')

const { buildAuthorizedQuery } = require('../utils')
const { defineAbilityFor } = require('../utils/defineAbility')

const resolvers = {
  branch: async (_, { query: { _id } }, { dataSources }) => {
    return dataSources.branches.collection.findOne({
      _id: ObjectId(_id),
    })
  },
  branches: async (_, argv, { dataSources, user }) => {
    const ability = defineAbilityFor(user)
    const authorizedQuery = buildAuthorizedQuery(ability, 'Branch', 'read')

    return dataSources.branches.collection
      .find(authorizedQuery)
      .sort({ name: 1 })
      .toArray()
  },
  branchId: async (parent, _, { dataSources }) => {
    return dataSources.branches.findOneById(parent.branchId)
  },
}

module.exports = resolvers
