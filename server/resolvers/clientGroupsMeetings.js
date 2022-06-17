const { ObjectId } = require('mongodb')

const collectInstallment = require('./legacy/collectInstallment')
const todayMeeting = require('./legacy/resolveTodayClientGroupMeeting')
const todayRealizations = require('./legacy/resolveTodayRealizations')

const resolvers = {
  clientGroupsMeeting: async (_, argv, { dataSources }) => {
    const loanOfficerId = argv?.query?.clientGroupId?.loanOfficerId?._id

    const branchId = argv?.query?.clientGroupId?.branchId?._id

    if (loanOfficerId || branchId) {
      const loanOfficer = loanOfficerId
        ? { 'clientGroup.loanOfficerId': ObjectId(loanOfficerId) }
        : {}

      const branchManager = branchId
        ? { 'clientGroup.branchId': ObjectId(branchId) }
        : {}

      const data = await dataSources.clientGroupsMeetings.collection
        .aggregate([
          {
            $lookup: {
              from: 'clientGroups',
              localField: 'clientGroupId',
              foreignField: '_id',
              as: 'clientGroup',
            },
          },
          {
            $unwind: {
              path: '$clientGroup',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              _id: ObjectId(argv?.query?._id),
              // TODO: Find better names for the variables below
              ...loanOfficer,
              ...branchManager,
            },
          },
        ])
        .toArray()

      if (data.length > 0) {
        return data[0]
      }

      return []
    }

    return dataSources.clientGroupsMeetings.collection.findOne({
      _id: ObjectId(argv?.query?._id),
    })
  },
  clientGroupsMeetings: async (_, argv, { dataSources }) => {
    const loanOfficerId = argv?.query?.clientGroupId?.loanOfficerId?._id

    const branchId = argv?.query?.clientGroupId?.branchId?._id

    const loanOfficer = loanOfficerId
      ? { 'clientGroup.loanOfficerId': ObjectId(loanOfficerId) }
      : {}

    const branchManager = branchId
      ? { 'clientGroup.branchId': ObjectId(branchId) }
      : {}

    return dataSources.clientGroupsMeetings.collection
      .aggregate([
        {
          $lookup: {
            from: 'clientGroups',
            localField: 'clientGroupId',
            foreignField: '_id',
            as: 'clientGroup',
          },
        },
        {
          $unwind: {
            path: '$clientGroup',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            clientGroupId: ObjectId(argv?.query?.clientGroupId?._id),
            // TODO: Find better names for the variables below
            ...loanOfficer,
            ...branchManager,
          },
        },
      ])
      .toArray()
  },
  collectInstallment,
  todayMeeting,
  todayRealizations,
}

module.exports = resolvers
