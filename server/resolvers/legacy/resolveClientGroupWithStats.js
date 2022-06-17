const { ObjectId } = require('mongodb')

const clientGroupWithStats = async (_, { input: arg }, { dataSources }) => {
  const clientGroupId = ObjectId(arg)
  const clientGroup = await dataSources.clientGroups.collection
    .find({ _id: clientGroupId })
    .next()
  const clients = await dataSources.clients.collection
    .find({ clientGroupId, status: { $nin: ['deleted'] } })
    .toArray()
  const clientsIds = clients.map(client => client._id)
  const query = {
    clientId: { $in: clientsIds },
    status: { $in: ['active', 'notpaid'] },
  }
  const loans = await dataSources.loans.collection.find(query).toArray()

  let loansOutstanding = 0
  let securityBalance = 0

  // Loans outstanding

  loans.forEach(loan => {
    const approvedAmount = loan.approvedAmount

    const realization = loan.installments.reduce((acc, installment = {}) => {
      const { realization = 0, total, target } = installment
      return acc + (isNaN(realization) ? 0 : realization) + (total - target)
    }, 0)

    const loanOutstanding =
      approvedAmount + (approvedAmount * loan.interestRate) / 100 - realization

    loansOutstanding = loansOutstanding + Math.ceil(loanOutstanding)
  })

  // Security balance

  clients.forEach(client => {
    securityBalance = securityBalance + (client.securityBalance || 0)
  })

  return {
    loansOutstanding,
    securityBalance,
    ...clientGroup,
  }
}

module.exports = clientGroupWithStats
