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

  const groupsToDelete = await db
    .collection('clientGroups')
    .aggregate([
      {
        $match: {
          name: {
            $regex: RegExp(
              '(all times)|(asobola)|(god is able)|(god is powerful)|(kitala)|(mukama mulungi)|(victory)',
              'i'
            ),
          },
          createdAt: {
            $gte: new Date('2022-03-04T21:00:00.000Z'),
            $lte: new Date('2022-03-04T23:59:59.000Z'),
          },
        },
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: 'clientGroupId',
          as: 'clients',
        },
      },
      {
        $addFields: {
          clientsCount: {
            $size: '$clients',
          },
        },
      },
      {
        $match: {
          clientsCount: 0,
        },
      },
      // {
      //   $count: 'total',
      // },
    ])
    .toArray()

  groupsToDelete.forEach(g => {
    console.log(
      `https://app.yamafrica.com/groups/${g._id.toString()}/clients`,
      g.name
    )
  })

  const importId = new ObjectId()
  const timestamp = new Date()

  const deleteEvents = groupsToDelete.map(({ _id }) => ({
    obj: 'clientGroup',
    type: 'delete',
    objId: _id,
    timestamp,
    importId,
    importNotes: 'Delete empty duplicate Groups due to wrong import',
  }))

  console.log(deleteEvents)

  await db.collection('events').insertMany(deleteEvents)
  await db
    .collection('clientGroups')
    .deleteMany({ _id: { $in: groupsToDelete.map(form => form._id) } })

  await disconnect()
}

main()
