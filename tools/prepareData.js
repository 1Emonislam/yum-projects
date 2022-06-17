const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const _ = require('lodash')
const yamrc = require('shared/yamrc')
const {
  generateHolidays,
  generateUsers,
  generateClient,
  generateBranch,
  generateLoanOfficer,
  generateClientGroup,
  generateLoanProducts,
  generateForms,
  generateClientGroupMeetings,
  generateLoan,
  generateSettings,
} = require('./generators')
const { getRealmUsersIds } = require('./getRealmUsers')
const { normalizePhoneNumber } = require('shared/utils/normalizePhoneNumber')
const { ObjectId } = require('./client')

const argv = yargs(hideBin(process.argv)).argv

const debug = (...args) => {
  if (argv.debug) {
    console.log(...args)
  }
}

const prepareData = async (rawRecords, initialValues, db) => {
  if (argv.clean) {
    console.log('Deleting all events')
    await db.collection('events').deleteMany({})
  }

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
    clientGroups: [],
    clients: [],
    holidays: [],
    loanProducts: [],
    loans: [],
    settings: [],
    users: [],
  }

  const realmUsersIds = await getRealmUsersIds()

  const records = rawRecords.map(record => ({
    ...record,
    'branch name': record['branch name']
      .trim()
      .split(' ')
      .map(str => _.capitalize(str))
      .join(' '),
    'group name': record['group name']
      .trim()
      .split(' ')
      // .map(str => _.capitalize(str)) // This causes duplicate groups
      .join(' '),
    'member first name': record['member first name']
      .trim()
      .split(' ')
      .map(str => _.capitalize(str))
      .join(' '),
    'member middle name': record['member middle name']
      .trim()
      .split(' ')
      .map(str => _.capitalize(str))
      .join(' '),
    'member last name': record['member last name']
      .trim()
      .replaceAll(',', '')
      .split(' ')
      .map(str => _.capitalize(str))
      .join(' '),
    'loan officer name': record['loan officer name']
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

  const dbClientGroups = (
    await db
      .collection('clientGroups')
      .find({ branchId: { $exists: true } })
      .limit(10000)
      .toArray()
  ).map(group => {
    const branch = dbBranches.find(branch => branch._id.equals(group.branchId))

    return {
      ...group,
      branch,
    }
  })

  for (let clientGroup of dbClientGroups) {
    cache.clientGroups.push(
      [
        clientGroup.branch.name.trim().toLowerCase(),
        clientGroup.name.trim().toLowerCase(),
      ].join(': ')
    )
    data.clientGroups.push({ ...clientGroup, _meta: { existing: true } })
  }

  const dbClients = (
    await db
      .collection('clients')
      .find({ _id: { $ne: ObjectId('613706ffb426a1dfc9134901') } })
      .limit(100000)
      .toArray()
  ).map(client => {
    const group = dbClientGroups.find(group =>
      group._id.equals(client.clientGroupId)
    )

    return {
      ...client,
      clientGroup: group,
    }
  })

  for (let client of dbClients) {
    if (client.clientGroup) {
      cache.clients.push(
        [
          String(client.lastName).trim().toLowerCase(),
          String(client.firstName).trim().toLowerCase(),
          String(client.clientGroup.name).trim().toLowerCase(),
          String(client.clientGroup.branch.name).trim().toLowerCase(),
        ].join()
      )
      data.clients.push({ ...client, _meta: { existing: true } })
    }
  }

  const dbHolidays = await db
    .collection('holidays')
    .find({})
    .limit(1000)
    .toArray()

  for (let holiday of dbHolidays) {
    cache.holidays.push(
      [holiday.name, holiday.startAt, holiday.endAt, holiday.yearly].join()
    )
    data.holidays.push({ ...holiday, _meta: { existing: true } })
  }

  const dbLoanProducts = await db
    .collection('loanProducts')
    .find({})
    .limit(100)
    .toArray()

  for (let loanProduct of dbLoanProducts) {
    cache.loanProducts.push(loanProduct.name)
    data.loanProducts.push({ ...loanProduct, _meta: { existing: true } })
  }

  const dbLoans = await db
    .collection('loans')
    .find(
      {},
      {
        projection: {
          _id: 1,
          approvedAmount: 1,
          branchName: 1,
          cashCollateral: 1,
          clientGroupName: 1,
          clientId: 1,
          code: 1,
          cycle: 1,
          duration: 1,
          interestRate: 1,
          loanInsurance: 1,
          loanOfficerName: 1,
          requestedAmount: 1,
        },
      }
    )
    .limit(100000)
    .toArray()

  for (let loan of dbLoans) {
    debug(`Loan ${loan.code} (${loan._id}): Skipping…`)

    cache.loans.push(
      [
        loan.approvedAmount,
        loan.branchName,
        loan.cashCollateral,
        loan.clientGroupName,
        loan.clientId,
        loan.cycle,
        loan.duration,
        loan.interestRate,
        loan.loanInsurance,
        loan.loanOfficerName,
        loan.requestedAmount,
      ].join()
    )
    data.loans.push({ ...loan, _meta: { existing: true } })
  }

  const dbSettings = await db
    .collection('settings')
    .find({})
    .limit(100)
    .toArray()

  for (let setting of dbSettings) {
    cache.settings.push(setting.name)
    data.settings.push({ ...setting, _meta: { existing: true } })
  }

  const dbUsers = await db.collection('users').find({}).limit(10000).toArray()

  for (let user of dbUsers) {
    cache.users.push(normalizePhoneNumber(user.fullPhoneNumber))
    data.users.push({ ...user, _meta: { existing: true } })
  }

  for (let record of records) {
    if (!cache.branches.includes(record['branch name'])) {
      data.branches.push({
        ...generateBranch(record, initialValues, data),
        _meta: { record },
      })
      cache.branches.push(record['branch name'])
    } else {
      debug(`Branch ${record['branch name']}: Skipping…`)
    }

    if (
      !cache.users.includes(
        normalizePhoneNumber(record['loan officer phone number'])
      )
    ) {
      const user = {
        ...generateLoanOfficer(data, record),
        _meta: { record },
      }
      data.users.push({
        ...user,
        realmUserId:
          realmUsersIds[`${user.firstName} ${user.lastName}`] || null,
      })
      cache.users.push(
        normalizePhoneNumber(record['loan officer phone number'])
      )
    } else {
      debug(
        `Loan Officer ${record['loan officer name']} (${normalizePhoneNumber(
          record['loan officer phone number']
        )}): Skipping…`
      )
    }

    if (
      !cache.clientGroups.includes(
        [
          record['branch name'].trim().toLowerCase(),
          record['group name'].trim().toLowerCase(),
        ].join(': ')
      )
    ) {
      data.clientGroups.push({
        ...generateClientGroup(data, record, records),
        _meta: { record },
      })
      cache.clientGroups.push(
        [
          record['branch name'].trim().toLowerCase(),
          record['group name'].trim().toLowerCase(),
        ].join(': ')
      )
    } else {
      debug(
        `Client group ${record['group name']} (branch ${record['branch name']}): Skipping…`
      )
    }
  }

  for (let record of records) {
    const firstName = String(
      `${record['member first name']} ${record['member middle name']}`
    ).trim()
    const lastName = record['member last name']

    if (
      !cache.clients.includes(
        [
          String(lastName).trim().toLowerCase(),
          String(firstName).trim().toLowerCase(),
          String(record['group name']).trim().toLowerCase(),
          String(record['branch name']).trim().toLowerCase(),
        ].join()
      )
    ) {
      data.clients.push({ ...generateClient(data, record), _meta: { record } })
    } else {
      debug(
        `Client ${record['member first name']} ${record['member middle name']} ${record['member last name']} (group ${record['group name']} @ ${record['branch name']}): Skipping…`
      )
    }

    data.loans.push({ _meta: { record } })
  }

  const holidays = generateHolidays()

  for (let holiday of holidays) {
    if (
      !cache.holidays.includes(
        [holiday.name, holiday.startAt, holiday.endAt, holiday.yearly].join()
      )
    ) {
      data.holidays.push(holiday)
      cache.holidays.push(
        [holiday.name, holiday.startAt, holiday.endAt, holiday.yearly].join()
      )
    } else {
      debug(`Holiday ${holiday.name}: Skipping…`)
    }
  }

  const loanProducts = generateLoanProducts()

  for (let loanProduct of loanProducts) {
    if (!cache.loanProducts.includes(loanProduct.name)) {
      data.loanProducts.push(loanProduct)
      cache.loanProducts.push(loanProduct.name)
    } else {
      debug(`Loan product ${loanProduct.name}: Skipping…`)
    }
  }

  const settings = generateSettings()

  for (let setting of settings) {
    if (!cache.settings.includes(setting.name)) {
      data.settings.push(setting)
      cache.settings.push(setting.name)
    } else {
      debug(`Setting ${setting.name}: Skipping…`)
    }
  }

  const users = await generateUsers(data, realmUsersIds)

  for (let user of users) {
    if (!cache.users.includes(user.fullPhoneNumber)) {
      data.users.push(user)
      cache.users.push(user.fullPhoneNumber)
    } else {
      debug(
        `User ${user.lastName}, ${user.firstName} (${user.fullPhoneNumber}): Skipping…`
      )
    }
  }

  data.loans = data.loans
    .filter(loan => !loan._meta.existing)
    .map(loanData => {
      const firstName = String(
        `${loanData._meta.record['member first name']} ${loanData._meta.record['member middle name']}`
      ).trim()
      const lastName = loanData._meta.record['member last name']

      const branch = data.branches.find(
        branch =>
          branch.name.toLowerCase() ===
          loanData._meta.record['branch name'].toLowerCase()
      )

      const group = data.clientGroups.find(group => {
        return (
          group.name.toLowerCase() ===
            loanData._meta.record['group name'].toLowerCase() &&
          String(group.branchId) === String(branch._id)
        )
      })

      const client = data.clients.find(client => {
        return (
          client.firstName.toLowerCase().trim() ===
            firstName.toLowerCase().trim() &&
          client.lastName.toLowerCase().trim() ===
            lastName.toLowerCase().trim() &&
          String(client.clientGroupId) === String(group._id)
        )
      })

      const loan = generateLoan(data, {
        ...client,
        _meta: {
          ...client._meta,
          record: loanData._meta.record,
        },
      })

      if (loan) {
        if (
          cache.loans.includes(
            [
              loan.approvedAmount,
              loan.branchName,
              loan.cashCollateral,
              loan.clientGroupName,
              loan.clientId,
              loan.cycle,
              loan.duration,
              loan.interestRate,
              loan.loanInsurance,
              loan.loanOfficerName,
              loan.requestedAmount,
            ].join()
          )
        ) {
          return null
        }

        data.loans.push(loan)

        cache.loans.push(
          [
            loan.approvedAmount,
            loan.branchName,
            loan.cashCollateral,
            loan.clientGroupName,
            loan.clientId,
            loan.cycle,
            loan.duration,
            loan.interestRate,
            loan.loanInsurance,
            loan.loanOfficerName,
            loan.requestedAmount,
          ].join()
        )
      }

      return loan
    })
    .filter(loan => loan !== null && typeof loan !== 'undefined')

  data.forms = !yamrc.currentRealmApp.isFakeData ? [] : generateForms(data)

  data.clients = data.clients
    .filter(obj => !obj._meta?.existing)
    .map(client => {
      const clientLoans = data.loans.length
        ? data.loans.filter(
            loan => String(loan.clientId) === String(client._id)
          )
        : []

      if (clientLoans.length > 0) {
        return {
          ...client,
          loans: clientLoans.map(loan => loan._id),
        }
      }

      return client
    })

  data.securityBalances = data.clients
    .filter(client => client.securityBalance > 0)
    .map(client => {
      let clientGroup = data.clientGroups.find(
        clientGroup => String(clientGroup._id) === String(client.clientGroupId)
      )

      const loan = data.loans.find(
        loan => String(loan.clientId) === String(client._id)
      )

      const conditional = loan ? { loanId: loan._id } : {}

      const date = loan
        ? loan.disbursementAt
        : client.admissionAt || client.addedAt

      return {
        branchId: clientGroup.branchId,
        clientId: client._id,
        comment: 'Security balance from import',
        openingSecurityBalance: 0,
        closingSecurityBalance: client.securityBalance,
        change: client.securityBalance,
        date,
        ...conditional,
      }
    })

  data.clientsToUpdate = data.loans
    .filter(
      loan =>
        !data.clients.find(
          client => String(client._id) === String(loan.clientId)
        )
    )
    .map(loan => {
      const securityBalanceTransaction = data.securityBalances.find(
        item => String(item.clientId) === String(loan.clientId)
      )

      const securityBalance = securityBalanceTransaction
        ? {
            securityBalance: securityBalanceTransaction.closingSecurityBalance,
          }
        : {}

      return {
        _id: loan.clientId,
        status: 'active',
        loans: [loan._id],
        ...securityBalance,
      }
    })

  data.clientGroupMeetings = !yamrc.currentRealmApp.isFakeData
    ? []
    : generateClientGroupMeetings(data)

  return _.mapValues(data, collection =>
    collection
      .filter(obj => !obj._meta?.existing)
      .map(obj => _.omit(obj, '_meta'))
  )
}

module.exports = {
  prepareData,
}
