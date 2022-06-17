const { MongoDataSource } = require('apollo-datasource-mongodb')

class Users extends MongoDataSource {}

module.exports = Users
