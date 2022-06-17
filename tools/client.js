const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '.env') })

const { MongoClient, ObjectId } = require('mongodb')

const DB_URI = process.env.MONGODB_URI

let client

async function getDatabaseConnection(database) {
  client = new MongoClient(DB_URI.replace('__DATABASE__', database), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  const c = await client.connect()

  return c.db(database)
}

async function disconnect() {
  client.close()
}

function getClient() {
  return client
}

module.exports = {
  getDatabaseConnection,
  disconnect,
  ObjectId,
  getClient,
}
