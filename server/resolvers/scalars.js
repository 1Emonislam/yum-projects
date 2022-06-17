const { GraphQLScalarType } = require('graphql')

const { ObjectId } = require('mongodb')

const moment = require('moment-timezone')

const resolvers = {
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    serialize(value) {
      return moment(value).format()
    },
    parseValue(value) {
      return moment(value).toDate()
    },
    parseLiteral(ast) {
      return moment(ast.value).toDate()
    },
  }),
  Decimal: new GraphQLScalarType({
    name: 'Decimal',
    serialize(value) {
      return Number.parseFloat(value).toPrecision(2)
    },
    parseValue(value) {
      return Number(value)
    },
    parseLiteral(ast) {
      return Number(ast.value)
    },
  }),
  ObjectId: new GraphQLScalarType({
    name: 'ObjectId',
    serialize(value) {
      return String(value)
    },
    parseValue(value) {
      return new ObjectId(value)
    },
    parseLiteral(ast) {
      return new ObjectId(ast.value)
    },
  }),
}

module.exports = resolvers
