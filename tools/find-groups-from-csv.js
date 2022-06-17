const _ = require('lodash')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')
const { getDatabaseConnection, disconnect } = require('./client')
const { readCsv } = require('./csv')

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const { data } = readCsv(argv.file)

  const db = await getDatabaseConnection(argv.env)

  const branchNames = _.uniqBy(
    data.map(row => row['branch name'].trim()),
    name => name.toLowerCase()
  )

  const branches = await db
    .collection('branches')
    .find(
      { name: { $in: branchNames.map(bn => new RegExp(`^${bn}$`, 'i')) } },
      { projection: { _id: 1, name: 1 } }
    )
    .toArray()

  console.log(branches)

  const rows = _.uniqBy(data, row =>
    row['group name'].trim().toLowerCase()
  ).map(row => {
    const branch = branches.find(
      b =>
        b.name.trim().toLowerCase() === row['branch name'].trim().toLowerCase()
    )

    if (!branch) {
      throw new Error('No branch found!')
    }

    return {
      branchId: branch._id,
      groupName: row['group name'].trim(),
    }
  })

  console.log(rows)

  const query = {
    $or: rows.map(row => ({
      branchId: row.branchId,
      name: new RegExp(`^${row.groupName}$`, 'i'),
    })),
  }

  const groups = await db
    .collection('clientGroups')
    .find(query, { projection: { _id: 1, name: 1 } })
    .toArray()

  console.log(query, groups)

  console.log(rows.length, groups.length)

  console.log(
    groups.reduce(
      (agg, group, index) =>
        agg +
        `ObjectId('${group._id}')` +
        (index === groups.length - 1 ? '' : ', '),
      ''
    )
  )

  await disconnect()
}

main()
