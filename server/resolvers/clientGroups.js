const { ObjectId } = require('mongodb')

const { buildAuthorizedQuery } = require('../utils')
const { defineAbilityFor } = require('../utils/defineAbility')

const clientGroupWithStats = require('./legacy/resolveClientGroupWithStats')
const todayClientGroups = require('./legacy/resolveTodayClientGroups')

const resolvers = {
  clientGroup: async (_, argv, { dataSources }) => {
    const loanOfficerId = argv?.query?.loanOfficerId?._id

    const branchId = argv?.query?.branchId?._id

    const loanOfficer = loanOfficerId
      ? { loanOfficerId: ObjectId(loanOfficerId) }
      : {}

    const branchManager = branchId ? { branchId: ObjectId(branchId) } : {}

    return dataSources.clientGroups.collection.findOne({
      _id: ObjectId(argv?.query?._id),
      // TODO: Find better names for the variables below
      ...loanOfficer,
      ...branchManager,
    })
  },
  clientGroupId: async (parent, _, { dataSources }) => {
    return dataSources.clientGroups.findOneById(parent.clientGroupId)
  },
  clientGroups: async (_, argv, { dataSources, user }) => {
    const ability = defineAbilityFor(user)
    const authorizedQuery = buildAuthorizedQuery(ability, 'ClientGroup', 'read')

    let query = { ...authorizedQuery }

    let limit = 0

    const loanOfficerId = argv?.query?.loanOfficerId?._id

    const branchId = argv?.query?.branchId?._id

    const status = argv?.query?.status

    const statusNin = argv?.query?.status_nin

    const idLt = argv?.query?._id_lt

    const limitNumber = argv?.limit

    if (loanOfficerId) {
      query.loanOfficerId = ObjectId(loanOfficerId)
    }

    if (branchId) {
      query.branchId = ObjectId(branchId)
    }

    if (statusNin) {
      query.status = {
        $nin: statusNin,
      }
    }

    if (status) {
      query.status = status
    }

    if (idLt) {
      query._id = {
        $lt: ObjectId(idLt),
      }
    }

    if (limitNumber) {
      limit = limitNumber
    }

    const sort = argv?.sortBy === 'NAME_ASC' ? { name: 1 } : { _id: -1 }

    return dataSources.clientGroups.collection
      .find(query)
      .sort(sort)
      .limit(limit)
      .toArray()
  },
  clientGroupsCount: async (_, __, { dataSources }) => {
    return dataSources.clientGroups.collection.find().count()
  },
  clientGroupWithStats,
  todayClientGroups,
}

module.exports = resolvers
