const _ = require('lodash')
const { generateBranch, generateStaffMember } = require('./generators')
const { normalizePhoneNumber } = require('shared/utils/normalizePhoneNumber')
const bcrypt = require('bcrypt')

const prepareUsersData = async (rawRecords, initialValues, db) => {
  const data = {
    branches: [],
    clientGroupMeetings: [],
    clientGroups: [],
    clients: [],
    clientsToUpdate: [],
    forms: [],
    holidays: [],
    loanProducts: [],
    loans: [],
    settings: [],
    users: [],
    securityBalances: [],
  }

  const cache = {
    branches: [],
    users: [],
  }

  const records = rawRecords.map(record => ({
    ...record,
    ...(record['branches'] && { branches: record.branches.split(',') }),
    ...(record['branch name'] && {
      'branch name': record['branch name']
        .trim()
        .split(' ')
        .map(str => _.capitalize(str))
        .join(' '),
    }),
    'staff name': record['staff name']
      .trim()
      .split(' ')
      .map(str => _.capitalize(str))
      .join(' '),
  }))

  const dbBranches = await db
    .collection('branches')
    .find({})
    .limit(1000)
    .toArray()

  for (let branch of dbBranches) {
    cache.branches.push(branch.name)
    data.branches.push({ ...branch, _meta: { existing: true } })
  }

  const dbUsers = await db.collection('users').find({}).limit(10000).toArray()

  for (let user of dbUsers) {
    cache.users.push(user.fullPhoneNumber)
    data.users.push({ ...user, _meta: { existing: true } })
  }

  for (let record of records) {
    if (record['branch name']) {
      if (!cache.branches.includes(record['branch name'])) {
        data.branches.push({
          ...generateBranch(record, initialValues, data),
          _meta: { record },
        })
        cache.branches.push(record['branch name'])
      }
    }

    if (record.branches) {
      for (let branchName of record.branches) {
        if (!cache.branches.includes(branchName.trim())) {
          data.branches.push({
            ...generateBranch(
              { 'branch name': branchName },
              initialValues,
              data
            ),
            _meta: { record },
          })
          cache.branches.push(branchName)
        }
      }
    }

    if (!cache.users.includes(normalizePhoneNumber(record['phone number']))) {
      const user = {
        ...generateStaffMember(data, record),
        _meta: { record },
      }
      data.users.push({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      })
      cache.users.push(normalizePhoneNumber(record['phone number']))
    }
  }

  data.users = [...data.users]

  return _.mapValues(data, collection =>
    collection
      .filter(obj => !obj._meta?.existing)
      .map(obj => _.omit(obj, '_meta'))
  )
}

module.exports = {
  prepareUsersData,
}
