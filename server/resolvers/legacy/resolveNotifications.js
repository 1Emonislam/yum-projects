const { ObjectId } = require('mongodb')

const notifications = async (_, __, { user: contextUser, dataSources }) => {
  const userId = contextUser._id

  const user = await dataSources.users.collection.findOne({
    _id: ObjectId(userId),
  })

  let clientGroupsQueryUserRelatedPart

  switch (user.role) {
    case 'branchManager':
      clientGroupsQueryUserRelatedPart = { branchId: user.branchId }
      break
    case 'loanOfficer':
      clientGroupsQueryUserRelatedPart = { loanOfficerId: user._id }
      break
  }

  const clientGroupsQuery = {
    status: { $in: ['pending', 'active', 'inactive'] },
    ...clientGroupsQueryUserRelatedPart,
  }

  const clientGroupsArray = await dataSources.clientGroups.collection
    .find(clientGroupsQuery, {
      projection: { _id: 1, status: 1 },
    })
    .toArray()

  const clientGroupsArrayWithoutPending = clientGroupsArray.filter(
    clientGroup => clientGroup.status !== 'pending'
  )

  const clientsQuery = {
    status: { $nin: ['deleted'] },
    clientGroupId: {
      $in: clientGroupsArrayWithoutPending.map(group => group._id),
    },
  }

  const clients = await dataSources.clients.collection
    .find(clientsQuery)
    .toArray()

  const clientIds = clients.map(client => {
    return client._id
  })

  const formsRaw = await dataSources.forms.collection.count({
    status: 'pending',
    clientId: { $in: clientIds },
  })

  const loansRaw = await dataSources.loans.collection.count({
    status: 'awaitingManagerReview',
    clientId: { $in: clientIds },
  })

  const forms = formsRaw > 0

  const loans = loansRaw > 0

  const clientGroups = clientGroupsArray.some(
    clientGroup => clientGroup.status === 'pending'
  )

  return {
    forms,
    loans,
    clientGroups,
  }
}

module.exports = notifications
