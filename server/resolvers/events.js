const resolvers = {
  addEvent: async (_, { input }, { eventProcessor }) => {
    return eventProcessor.addEvent(input)
  },
}

module.exports = resolvers
