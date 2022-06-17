const resolvers = {
  feedbackId: async (parent, _, { dataSources }) => {
    return dataSources.feedback.collection.findOne({
      _id: parent.feedbackId,
    })
  },
}

module.exports = resolvers
