const { rulesToQuery } = require('@casl/ability/extra')

function convertToMongoQuery(rule) {
  const conditions = rule.conditions
  return rule.inverted ? { $nor: [conditions] } : conditions
}

function buildAuthorizedQuery(ability, subjectType, action = 'read') {
  return rulesToQuery(ability, action, subjectType, convertToMongoQuery)
}

module.exports = { buildAuthorizedQuery }
