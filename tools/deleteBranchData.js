const _ = require('lodash')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')
const chalk = require('chalk')
const axios = require('axios')
const yamrc = require('shared/yamrc')

const { getDatabaseConnection, disconnect, ObjectId } = require('./client')

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  if (
    yamrc.currentRealmApp.isProtected &&
    (!argv.force || argv.force.toLowerCase() !== 'imreallyreallysure')
  ) {
    console.log()
    interactive.error(
      'Please use --force=ImReallyReallySure in order to seed a protected environment'
    )
    console.log()
    process.exit(1)
  }

  if (yamrc.currentRealmApp.isProtected) {
    console.log()
    console.log()
    console.log(chalk.bgRed('                                      '))
    console.log(chalk.bgRed('                                      '))
    console.log(chalk.bgRed('             DANGER ZONE              '))
    console.log(chalk.bgRed('                                      '))
    console.log(chalk.bgRed('                                      '))
    console.log()
    console.log()
    const msg = `Deleting branch data on protected environment ${argv.env} in %d`
    await new Promise(r => {
      interactive.await(msg, 5)
      setTimeout(() => {
        interactive.await(msg, 4)
        setTimeout(() => {
          interactive.await(msg, 3)
          setTimeout(() => {
            interactive.await(msg, 2)
            setTimeout(() => {
              interactive.await(msg, 1)
              setTimeout(() => {
                interactive.await(msg, 0)
                setTimeout(() => {
                  r()
                }, 1000)
              }, 1000)
            }, 1000)
          }, 1000)
        }, 1000)
      }, 1000)
    })
  }

  const db = await getDatabaseConnection(argv.env)

  const branches = await db
    .collection('branches')
    .find({
      name: {
        $nin: ['Ntinda', 'Nakulabye'],
      },
    })
    .toArray()

  console.log(
    'Branches',
    branches.map(b => b._id.toString())
  )

  const groups = await db
    .collection('clientGroups')
    .find({ branchId: { $in: branches.map(b => b._id) } })
    .toArray()

  const meetings = await db
    .collection('clientGroupsMeetings')
    .find({ clientGroupId: { $in: groups.map(g => g._id) } })
    .toArray()

  const clients = await db
    .collection('clients')
    .find({ clientGroupId: { $in: groups.map(g => g._id) } })
    .toArray()

  const loans = await db
    .collection('loans')
    .find({ clientId: { $in: clients.map(c => c._id) } })
    .toArray()

  const feedback = await db
    .collection('feedback')
    .find({ clientId: { $in: clients.map(c => c._id) } })
    .toArray()

  const users = await db
    .collection('users')
    .find({ branchId: { $in: branches.map(b => b._id) } })
    .toArray()

  const cahs = await db
    .collection('cashAtHandForms')
    .find({ branchId: { $in: branches.map(b => b._id) } })
    .toArray()

  console.table([
    {
      branches: branches.length,
      groups: groups.length,
      meetings: meetings.length,
      clients: clients.length,
      loans: loans.length,
      users: users.length,
      cahs: cahs.length,
      feedback: feedback.length,
    },
  ])

  const objIds = {
    branches: branches.map(o => o._id),
    clientGroups: groups.map(o => o._id),
    clientGroupsMeetings: meetings.map(o => o._id),
    clients: clients.map(o => o._id),
    loans: loans.map(o => o._id),
    users: users.map(o => o._id),
    cashAtHandForms: cahs.map(o => o._id),
    feedback: feedback.map(o => o._id),
  }

  const objMap = _.invert({
    user: 'users',
    branch: 'branches',
    cashAtHandForm: 'cashAtHandForms',
    client: 'clients',
    clientGroup: 'clientGroups',
    form: 'forms',
    holiday: 'holidays',
    loanProduct: 'loanProducts',
    loan: 'loans',
    setting: 'settings',
    feedback: 'feedback',
    clientGroupMeeting: 'clientGroupsMeetings',
  })

  if (argv.dryRun) {
    console.log('Dry run, exiting')
    process.exit()
  }

  // const eventObjIds = Object.values(objIds).reduce((a, i) => a.concat(i), [])

  // console.log('Deleting events', JSON.stringify(eventObjIds, null, 2))

  // await db.collection('events').deleteMany({ objId: { $in: eventObjIds } })

  const objGroups = Object.entries(objIds)

  const importId = new ObjectId()
  const timestamp = new Date()

  for (let [collectionName, ids] of objGroups) {
    const deleteEvents = ids.map(id => ({
      obj: objMap[collectionName],
      type: 'delete',
      objId: id,
      timestamp,
      importId,
      importNotes: 'Delete groups on Umoja request',
    }))

    db.collection('events').insertMany(deleteEvents)

    console.log('Deleting from', collectionName, JSON.stringify(ids, null, 2))
    await db.collection(collectionName).deleteMany({ _id: { $in: ids } })
  }

  console.log('Done.')

  await disconnect()
}

main()
