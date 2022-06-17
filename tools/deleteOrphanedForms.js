const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')
const chalk = require('chalk')
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

  const formsToDelete = await db
    .collection('forms')
    .aggregate([
      {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'clients',
        },
      },
      {
        $match: {
          clients: {
            $size: 0,
          },
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ])
    .toArray()

  const importId = new ObjectId()
  const timestamp = new Date()

  const deleteEvents = formsToDelete.map(({ _id }) => ({
    obj: 'form',
    type: 'delete',
    objId: _id,
    timestamp,
    importId,
    importNotes: 'Delete orphaned forms due to incomplete deleteBranchData.js',
  }))

  for (let event of deleteEvents) {
    console.log(event)
  }

  await db.collection('events').insertMany(deleteEvents)
  await db
    .collection('forms')
    .deleteMany({ _id: { $in: formsToDelete.map(form => form._id) } })

  await disconnect()
}

main()
