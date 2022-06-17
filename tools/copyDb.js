const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')

const { getDatabaseConnection, disconnect, getClient } = require('./client')

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  if (!argv.sourceDb) {
    console.log()
    interactive.error('Please specify --sourceDb <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)
  const sourceDb = getClient().db(argv.sourceDb.trim())

  const rawCollections = await db.collections()
  const collections = rawCollections
    .map(collection => collection.namespace.split('.').pop())
    .filter(collection => collection !== 'events') // don't remove events!

  if (collections.includes('feedback')) {
    console.log('Dropping feedback collection')
    await db.dropCollection('feedback')
  }

  console.log('Creating feedback collection')
  await db.createCollection('feedback')
  await sourceDb
    .collection('feedback')
    .aggregate([{ $out: { db: argv.env, coll: 'feedback' } }])
    .toArray()

  if (collections.includes('settings')) {
    console.log('Dropping settings collection')
    await db.dropCollection('settings')
  }

  console.log('Creating settings collection')
  await db.createCollection('settings')
  await sourceDb
    .collection('settings')
    .aggregate([{ $out: { db: argv.env, coll: 'settings' } }])
    .toArray()

  if (collections.includes('branches')) {
    console.log('Dropping branches collection')
    await db.dropCollection('branches')
  }

  console.log('Creating branches collection')
  await db.createCollection('branches')
  await sourceDb
    .collection('branches')
    .aggregate([{ $out: { db: argv.env, coll: 'branches' } }])
    .toArray()

  if (collections.includes('clientGroups')) {
    console.log('Dropping clientGroups collection')
    await db.dropCollection('clientGroups')
  }

  console.log('Creating clientGroups collection')
  await db.createCollection('clientGroups')
  await sourceDb
    .collection('clientGroups')
    .aggregate([{ $out: { db: argv.env, coll: 'clientGroups' } }])
    .toArray()
  await db.collection('clientGroups').createIndex('loanOfficerId')
  await db.collection('clientGroups').createIndex('status')

  if (collections.includes('clientGroupsMeetings')) {
    console.log('Dropping clientGroupsMeetings collection')
    await db.dropCollection('clientGroupsMeetings')
  }

  console.log('Creating clientGroupsMeetings collection')
  await db.createCollection('clientGroupsMeetings')
  await sourceDb
    .collection('clientGroupsMeetings')
    .aggregate([{ $out: { db: argv.env, coll: 'clientGroupsMeetings' } }])
    .toArray()
  await db.collection('clientGroupsMeetings').createIndex('clientGroupId')
  await db
    .collection('clientGroupsMeetings')
    .createIndex({ clientGroupId: 1, scheduledAt: 1 })

  if (collections.includes('clients')) {
    console.log('Dropping clients collection')
    await db.dropCollection('clients')
  }

  console.log('Creating clients collection')
  await db.createCollection('clients')
  await sourceDb
    .collection('clients')
    .aggregate([{ $out: { db: argv.env, coll: 'clients' } }])
    .toArray()
  await db.collection('clients').createIndex('clientGroupId')

  if (collections.includes('cashAtHandForms')) {
    console.log('Dropping cashAtHandForms collection')
    await db.dropCollection('cashAtHandForms')
  }

  console.log('Creating cashAtHandForms collection')
  await db.createCollection('cashAtHandForms')
  await sourceDb
    .collection('cashAtHandForms')
    .aggregate([{ $out: { db: argv.env, coll: 'cashAtHandForms' } }])
    .toArray()

  if (collections.includes('forms')) {
    console.log('Dropping forms collection')
    await db.dropCollection('forms')
  }

  console.log('Creating forms collection')
  await db.createCollection('forms')
  await sourceDb
    .collection('forms')
    .aggregate([{ $out: { db: argv.env, coll: 'forms' } }])
    .toArray()

  if (collections.includes('holidays')) {
    console.log('Dropping holidays collection')
    await db.dropCollection('holidays')
  }

  console.log('Creating holidays collection')
  await db.createCollection('holidays')
  await sourceDb
    .collection('holidays')
    .aggregate([{ $out: { db: argv.env, coll: 'holidays' } }])
    .toArray()

  if (collections.includes('loanProducts')) {
    console.log('Dropping loanProducts collection')
    await db.dropCollection('loanProducts')
  }

  console.log('Creating loanProducts collection')
  await db.createCollection('loanProducts')
  await sourceDb
    .collection('loanProducts')
    .aggregate([{ $out: { db: argv.env, coll: 'loanProducts' } }])
    .toArray()

  if (collections.includes('loans')) {
    console.log('Dropping loans collection')
    await db.dropCollection('loans')
  }

  console.log('Creating loans collection')
  await db.createCollection('loans')
  await sourceDb
    .collection('loans')
    .aggregate([{ $out: { db: argv.env, coll: 'loans' } }])
    .toArray()
  await db.collection('loans').createIndex('clientId')

  if (collections.includes('users')) {
    console.log('Dropping users collection')
    await db.dropCollection('users')
  }

  console.log('Creating users collection')
  await db.createCollection('users')
  await sourceDb
    .collection('users')
    .aggregate([{ $out: { db: argv.env, coll: 'users' } }])
    .toArray()

  if (collections.includes('securityBalances')) {
    console.log('Dropping securityBalances collection')
    await db.dropCollection('securityBalances')
  }

  console.log('Creating securityBalances collection')
  await db.createCollection('securityBalances')
  await sourceDb
    .collection('securityBalances')
    .aggregate([{ $out: { db: argv.env, coll: 'securityBalances' } }])
    .toArray()

  console.log('Copying events collection')
  await sourceDb
    .collection('events')
    .aggregate([{ $out: { db: argv.env, coll: 'events' } }])
    .toArray()

  console.log('Done.')

  await disconnect()
}

main()
