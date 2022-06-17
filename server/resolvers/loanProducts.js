const resolvers = {
  loanProductId: async (parent, _, { dataSources }) => {
    return dataSources.loanProducts.collection.findOne({
      _id: parent.loanProductId,
    })
  },
  loanProducts: async (_, __, { dataSources }) => {
    return dataSources.loanProducts.collection.find().toArray()
  },
}

module.exports = resolvers
