const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const MongoDB = require('mongodb')
const faker = require('faker')
const moment = require('moment-timezone')
const _ = require('lodash')
const {
  generateBranchCode,
  generateClientCode,
  generateClientGroupCode,
  generateLoanCode,
} = require('./generateCodes')
const {
  frequencyToDurationUnit,
  generateInstallments,
} = require('shared/utils/index.js')
const yamrc = require('shared/yamrc')
import { timezone } from 'shared/constants'
import { normalizePhoneNumber } from 'shared/utils'

const { ObjectId } = MongoDB

const argv = yargs(hideBin(process.argv)).argv

const daysMap = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
}

const importDate = argv.date ? moment.tz(argv.date, timezone) : moment() // 2021-06-15
console.log('Importing as per date', importDate.format('YYYY-MM-DD'))

const debug = (...args) => {
  if (argv.debug) {
    console.log(...args)
  }
}

const generateCode = (text, count = 5) => {
  if (text.length <= count) {
    return text.toUpperCase()
  }

  const arr = text.toUpperCase().split('')

  for (let i = 0; i < text.length - count; i++) {
    const pos = Math.floor(Math.random() * Math.floor(arr.length))

    arr.splice(pos, 1)
  }

  return arr.join('')
}

const generateUserData = () => {
  // invitedAt  joinedAt  joinedAt  joinedAt
  const status = !yamrc.currentRealmApp.isFakeData
    ? 'active'
    : faker.random.arrayElement(['invited', 'active', 'disabled', 'deleted'])

  return {
    invitedAt: moment().toDate(),
    joinedAt: status !== 'invited' ? moment().add(1, 'day').toDate() : null,
    status,
  }
}

// FIXME: get rid of either phoneNumber of fullPhoneNumber
const generateUsers = async (data, realmUsersIds) => {
  return [
    {
      _id: new ObjectId('6022909476e0b1068a5e62ac'),
      firstName: 'Chris',
      lastName: 'Bujok',
      fullPhoneNumber: '+48669204935',
      phoneNumber: '+48669204935',
      // TODO: is it necessary?
      realmUserId: realmUsersIds['Chris Bujok'] || null,
      branchId: data.branches[0]._id,
      role: !yamrc.currentRealmApp.isFakeData ? 'admin' : 'loanOfficer',
      ...generateUserData(),
    },
    {
      _id: new ObjectId('6040cdb9ede849560a3473ca'),
      firstName: 'Sayful',
      lastName: 'Islam',
      fullPhoneNumber: '+256703759667',
      phoneNumber: '+256703759667',
      realmUserId: realmUsersIds['Sayful Islam'] || null,
      role: 'admin',
      branchId: data.branches[0]._id,
      ...generateUserData(),
    },
    {
      _id: new ObjectId('6040d080ede849560a3473cb'),
      firstName: 'Mark',
      lastName: 'Mwebaza',
      fullPhoneNumber: '+256758231090',
      phoneNumber: '+256758231090',
      realmUserId: realmUsersIds['Mark Mwebaza'] || null,
      role: 'admin',
      branchId: data.branches[0]._id,
      ...generateUserData(),
    },
    {
      _id: new ObjectId('60460695f4ae1535b93fd61a'),
      firstName: 'Greg',
      lastName: 'Wolanski',
      fullPhoneNumber: '+48530830807',
      phoneNumber: '+48530830807',
      realmUserId: realmUsersIds['Greg Wolanski'] || null,
      branchId: data.branches[0]._id,
      role: 'admin',
      ...generateUserData(),
    },
    {
      _id: new ObjectId('607ecc614ec19782b2039dfc'),
      firstName: 'Nantale',
      lastName: 'Monica',
      fullPhoneNumber: '+256754946800',
      phoneNumber: '+256754946800',
      branchId: data.branches[0]._id,
      realmUserId: realmUsersIds['Nantale Monica'] || null,
      role: 'branchManager',
      ...generateUserData(),
    },
    {
      _id: new ObjectId('607ecc614ec19782b2039dfd'),
      firstName: 'Vinnie',
      lastName: 'Onyando',
      fullPhoneNumber: '+256786085985',
      phoneNumber: '+256786085985',
      realmUserId: realmUsersIds['Vinnie Onyando'] || null,
      role: 'admin',
      ...generateUserData(),
    },
  ]
}

const generateBranch = (record, initialValues, data) => {
  let address = {}

  if (!yamrc.currentRealmApp.isFakeData) {
    const chunks = (
      record['branch address'] ||
      'Street: Plot 667, Sub county: Nakawa, County: Nakawa, District: Kampala'
    )
      .split(',')
      .map(chunk => chunk.trim())

    const chunksDict = chunks.reduce((all, chunk) => {
      const attrs = chunk.split(':').map(attr => attr.trim())

      return {
        ...all,
        [attrs[0].toLowerCase()]: attrs[1],
      }
    }, {})

    address = {
      street: chunksDict['street'],
      area: chunksDict['village'],
      subcounty: chunksDict['sub county'],
      county: chunksDict['county'],
      district: chunksDict['district'],
    }
  } else {
    address = {
      street: faker.address.streetAddress(),
      area: '',
      subcounty: '',
      county: faker.address.county(),
      district: faker.address.county(),
    }
  }

  const name = record['branch name'].trim()
  const values =
    initialValues.find(value => value['branch name']?.trim() === name) || {}

  return {
    _id: new ObjectId(),
    name,
    initDate: moment(values['date'], 'DD.MM.YYYY').tz(timezone).toDate(),
    initOpeningBalance: parseInt(values['opening cash at hand'] || 0),
    code: generateBranchCode(data.branches.length),
    // TODO: get manager logic here
    // managerId: manager._id,
    address,
    others: !yamrc.currentRealmApp.isFakeData
      ? {}
      : {
          servicingBanks: faker.random
            .arrayElements([1, 2, 3])
            .map(() => faker.company.companyName())
            .join('\n'),
          majorCompetitors: faker.lorem.words(20),
          outreach: faker.lorem.words(20),
        },
    status: 'active',
  }
}

const generateLoanOfficer = (data, record) => {
  const nameDecomposed = record['loan officer name'].split(' ')

  const { 0: lastName, ...rest } = nameDecomposed

  const firstName = Object.keys(rest)
    .map(key => rest[key])
    .join(' ')

  const branch = data?.branches?.find(
    branch => branch.name === record['branch name']
  )

  return {
    _id: new ObjectId(),
    _seed: record['loan officer name'],
    firstName: firstName ? firstName : lastName,
    lastName: firstName ? lastName : 'MISSING',
    role: 'loanOfficer',
    branchId: branch._id,
    fullPhoneNumber: !yamrc.currentRealmApp.isFakeData
      ? normalizePhoneNumber(record['loan officer phone number'])
      : '+256111111111',
  }
}

const generateStaffMember = (
  data,
  record,
  nameField = 'staff name',
  phoneNumberField = 'phone number'
) => {
  const nameDecomposed = record[nameField].split(' ')

  let role = 'loanOfficer'

  if (record['designation']) {
    switch (record['designation']) {
      case 'BM':
        role = 'branchManager'
        break
      case 'LO':
        role = 'loanOfficer'
        break
      case 'RM':
        role = 'regionalManager'
        break
      case 'AM':
        role = 'areaManager'
        break
      case 'Admin':
      default:
        role = 'admin'
    }
  }

  const { 0: lastName, ...rest } = nameDecomposed

  const firstName = Object.keys(rest)
    .map(key => rest[key])
    .join(' ')

  return {
    _id: new ObjectId(),
    _seed: record[nameField],
    firstName: firstName ? firstName : lastName,
    lastName: firstName ? lastName : 'MISSING',
    password: record['password'],
    role,
    ...(record.branches && {
      branchIds: record.branches.map(branchName => {
        return data.branches.find(branch => branch.name === branchName.trim())
          ._id
      }),
    }),
    branchId:
      record?.branches?.length > 0
        ? data.branches.find(b => b.name === record.branches[0].trim())._id
        : data.branches.find(b => b.name === record['branch name'].trim())._id,
    fullPhoneNumber: !yamrc.currentRealmApp.isFakeData
      ? normalizePhoneNumber(record[phoneNumberField])
      : '+256111111111',
  }
}

const generateClientGroup = (data, record) => {
  const branch = data?.branches?.find(
    branch => branch.name === record['branch name']
  )

  const loanOfficer = data?.users?.find(
    lo =>
      lo.fullPhoneNumber ===
      normalizePhoneNumber(record['loan officer phone number'])
  )

  const meetingTime = !yamrc.currentRealmApp.isFakeData
    ? record['group meeting time'] !== '0'
      ? record['group meeting time']
          .replace('AM', '')
          .replace('1:00pm', '13:00')
          .replace('pm', '')
          .replace('300am', '30')
          .replace('am', '')
          .replace(';', ':')
          .replace('01:00:00', '13:00')
          .replace(':00:00', ':00')
          .replace('013:00', '13:00')
          .split(':')
          .slice(0, 2)
          .reduce((t, i) => `${t}:${i}`, '')
          .substr(1)
      : '23:45'
    : faker.random.arrayElement(['8:30', '9:30', '10:30'])

  return {
    name: record['group name'],
    _id: new ObjectId(),
    branchId: branch._id,
    loanOfficerId: loanOfficer._id,
    code: generateClientGroupCode(data.clientGroups.length),
    meeting: {
      dayOfWeek: !yamrc.currentRealmApp.isFakeData
        ? daysMap[
            record['meeting day']
              .trim()
              .toLowerCase()
              .replace('wesdensday', 'wednesday')
              .replace('wednseday', 'wednesday')
              .replace('thusday', 'thursday')
              .replace('thurseday', 'thursday')
          ]
        : faker.random.arrayElement([1, 2, 3, 4, 5, 6, 7]),
      address: !yamrc.currentRealmApp.isFakeData
        ? // ? generateAddressFromString(record['group meeting address'])
          record['group meeting address']
        : faker.address.streetAddress(),
      lat: !yamrc.currentRealmApp.isFakeData ? '0' : faker.address.latitude(),
      lng: !yamrc.currentRealmApp.isFakeData ? '0' : faker.address.longitude(),
      time: meetingTime,
      frequency: record['meeting frequency']
        ? String(record['meeting frequency']).trim().toLowerCase()
        : 'weekly',
      startedAt: record['meetings started']
        ? moment.tz(record['meetings started'], 'DD/MM/YYYY', timezone)
        : null,
    },
    status: !yamrc.currentRealmApp.isFakeData
      ? 'active'
      : faker.random.arrayElement(['draft', 'pending', 'active']),
  }
}

const generateClientGroupMeetings = data => {
  let meetings = []

  data.clientGroups
    .filter(clientGroup => clientGroup.status === 'active')
    .map(clientGroup => {
      const numberOfMeetingsToGenerate = faker.datatype.number({
        min: 1,
        max: 52,
      })

      const time = clientGroup.meeting.time.split(':')
      const hour = time[0]
      const minutes = time[1]

      const firstMeeting = moment()
        .tz('Africa/Kampala')
        .isoWeekday(clientGroup.meeting.dayOfWeek)
        .set('hour', Number(hour))
        .set('minute', Number(minutes))
        .subtract(numberOfMeetingsToGenerate, 'weeks')

      const shouldGenerateMeetings =
        data.clients.filter(
          client =>
            client.status === 'active' &&
            client.clientGroupId === clientGroup._id
        ).length > 0

      if (shouldGenerateMeetings) {
        Array.from(Array(numberOfMeetingsToGenerate).keys()).forEach(
          (a, index) => {
            const scheduledAt = moment(firstMeeting)
              .tz('Africa/Kampala')
              .set('hour', Number(hour))
              .set('minute', Number(minutes))
              .add(index, 'weeks')

            const startedAt = moment(scheduledAt)
              .tz('Africa/Kampala')
              .set('hour', Number(hour))
              .set('minute', Number(minutes))
              .add(
                faker.datatype.number({
                  max: 29,
                }),
                'minutes'
              )

            const endedAt = moment(startedAt)
              .tz('Africa/Kampala')
              .add(
                faker.datatype.number({
                  min: 30,
                  max: 60,
                }),
                'minutes'
              )

            const clients = data.clients.filter(
              client =>
                (client.status === 'active' || client.status === 'toSurvey') &&
                client.clientGroupId === clientGroup._id
            )

            meetings.push({
              _id: new ObjectId(),
              clientGroupId: clientGroup._id,
              scheduledAt: scheduledAt.toDate(),
              startedAt: startedAt.toDate(),
              photoUrl:
                'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
              attendance: clients.map(client => {
                const attended = faker.random.arrayElement([true, false])

                return {
                  firstName: client.firstName,
                  lastName: client.lastName,
                  clientId: client._id,
                  representative: attended
                    ? faker.random.arrayElement([true, false])
                    : false,
                  attended,
                }
              }),
              installments: clients
                .filter(client => client.status === 'active')
                .map(client => {
                  const total =
                    500 * faker.datatype.number({ min: 45, max: 68 })

                  const realization = faker.random.arrayElement([1, 0])

                  return {
                    clientId: client._id,
                    clientName: client.lastName + ', ' + client.firstName,
                    due: moment(scheduledAt)
                      .tz('Africa/Kampala')
                      .endOf('day')
                      .toDate(),
                    number: faker.datatype.number({ min: 1, max: 40 }),
                    total,
                    target: total,
                    openingBalance: faker.random.arrayElement(['1', '0']),
                    realization: realization,
                    status: realization === 1 ? 'paid' : 'late',
                  }
                }),
              requests: faker.random.arrayElement(['Sample request', '']),
              potentialClientsVerified: false,
              notes: faker.random.arrayElement(['Sample note', '']),
              endedAt: endedAt.toDate(),
            })
          }
        )
      }
    })

  return meetings
}

const clientRoles = ['president', 'secretary', 'cashier', 'member']
const clientStatuses = ['active', 'toSurvey', 'inactive', 'deleted']

const clientRolesAliases = {
  chairperson: 'president',
  'group member': 'member',
}

const generateClient = (data, record) => {
  const clientId = record['clientid']
    ? new ObjectId(record['clientid'].trim())
    : new ObjectId()

  const clientGroup = data.clientGroups.find(group => {
    const branch = data.branches.find(
      branch => branch.name === record['branch name']
    )

    return (
      group.name.trim().toLowerCase() ===
        record['group name'].trim().toLowerCase() &&
      String(group.branchId) === String(branch._id)
    )
  })
  // FIXME: generate on fly
  const passbookIdentifier = !yamrc.currentRealmApp.isFakeData
    ? record['client passbook identifefiers']
    : `${faker.datatype.number(100)}/100`

  const firstName = String(
    `${record['member first name']} ${record['member middle name']}`
  ).trim()
  const lastName = record['member last name']

  const admissionDate = record['member admission date']

  const loanPrincipalAmount = parseInt(
    record['principal amount'].replace(/ /g, '')
  )

  const securityBalance =
    parseInt(record['security balance'].replace(/ /g, '')) || 0

  const status =
    loanPrincipalAmount && loanPrincipalAmount > 0 ? 'active' : 'toSurvey'

  const rawRole = record['chairperson, secretary, cashier'].trim().toLowerCase()

  const role =
    clientRolesAliases[rawRole] || clientRoles.find(role => role === rawRole)

  if (role === 'cashier') {
    clientGroup.cashierId = clientId
  }

  if (role === 'secretary') {
    clientGroup.secretaryId = clientId
  }

  if (role === 'president') {
    clientGroup.presidentId = clientId
  }

  return {
    _id: clientId,
    code: generateClientCode(data.clients.length),
    firstName,
    lastName,
    clientGroupId: clientGroup._id,
    // role: !yamrc.currentRealmApp.isFakeData
    //   ? clientRolesAliases[rawRole] ||
    //     clientRoles.find(role => role === rawRole)
    //   : faker.random.arrayElement(clientRoles),
    photo: '',
    admission: {
      address: !yamrc.currentRealmApp.isFakeData
        ? record['detailed addresses']
        : 'Plot 11 Ben Okot, Bukoto, Kampala',
      notes: '',
    },
    admissionAt: moment.tz(admissionDate, 'DD/MM/YYYY', timezone).toDate(),
    lastRenewalAt: null,
    loans: [],
    passbook: true,
    status: !yamrc.currentRealmApp.isFakeData
      ? status
      : faker.random.arrayElement(clientStatuses),
    passbookIdentifier,
    securityBalance,
  }
}

const statuses = [
  // 'draft',
  'awaitingManagerReview',
  'approvedByManager',
  'rejectedByManager',
  // 'acceptedByClient',
  // 'rejectedByClient',
  // 'awaitingDisbursementReadiness',
  // 'readyForDisbursement',
  'active',
  // 'notpaid'
  // 'late1',
  // 'late2',
  // 'nibl',
  // 'repaid',
]

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const generateLoan = (data, client) => {
  const { users, clientGroups, branches, loanProducts, holidays } = data

  const amount = parseInt(
    client._meta.record['principal amount'].replace(/ /g, '')
  )

  if (!amount) {
    debug('No loan amount for client', client.lastName, client.firstName)
    return
  }

  let loanProductName =
    client._meta.record['loan product name'] || 'Small Loan 2022'

  if (!loanProductName) {
    debug('No loan product name for client', client.lastName, client.firstName)
    return
  }

  const interestRate = !yamrc.currentRealmApp.isFakeData
    ? parseInt(`${client._meta.record['interest rate(%)']}`.replace('%', ''))
    : getRandomInt(8, 29)
  const numberOfInstallments = parseInt(
    client._meta.record['total number installment']
  )

  if (!numberOfInstallments) {
    debug(
      'No number of installments for client',
      client.lastName,
      client.firstName
    )
    return
  }

  const clientGroupId = client.clientGroupId
  const clientGroup = clientGroups.find(
    clientGroup => String(clientGroup._id) === String(clientGroupId)
  )

  if (!clientGroup.meeting.dayOfWeek) {
    debug('No group meeting day of week', clientGroup)
    // process.exit()
    return
  }

  const branch = branches.find(
    branch => String(branch._id) === String(clientGroup.branchId)
  )
  const branchId = branch._id
  const branchName = branch.name
  const branchManager = users.find(
    user =>
      user.role === 'branchManager' &&
      String(user.branchId) === String(branchId)
  )

  if (!branchManager) {
    console.error(
      'Error: Missing branch manager for branch %s %s. Import users first.',
      branchId,
      branch.name
    )
    process.exit()
  }

  const loanOfficerId = clientGroup.loanOfficerId
  const loanOfficer = users.find(
    user => String(user._id) === String(loanOfficerId)
  )
  const loanOfficerName = [loanOfficer.lastName, loanOfficer.firstName].join(
    ', '
  )

  let loanProduct
  let loanProductId = faker.random.arrayElement(loanProducts)._id

  if (!yamrc.currentRealmApp.isFakeData) {
    loanProduct = loanProducts.find(
      product =>
        product.name.toLowerCase() === String(loanProductName).toLowerCase()
    )

    if (loanProduct) {
      loanProductId = loanProduct._id
      loanProductName = loanProduct.name
    }
  }

  const installmentAmount = parseInt(
    client._meta.record['installment amount'].replace(/ /g, '')
  )

  const installmentsStartDateFromCsv =
    client._meta.record['first installment collection date'].trim() &&
    moment.tz(
      client._meta.record['first installment collection date'].trim(),
      'DD/MM/YYYY',
      timezone
    )

  const disbursementDate = moment.tz(
    client._meta.record['disbursement date'],
    'DD/MM/YYYY',
    timezone
  )

  if (!installmentsStartDateFromCsv) {
    console.log(' ')
    console.log(' ')
    console.log(' ')
    console.log(client._meta.record['s/n'], client.lastName, client.firstName)
    console.log(' ')
    console.log(' ')
    console.log(' ')
    process.exit()
  }

  if (!interestRate) {
    console.log(' ')
    console.log(' ')
    console.log(' ')
    console.log(client._meta.record['s/n'], client.lastName, client.firstName)
    console.log(' ')
    console.log(' ')
    console.log(' ')
    process.exit()
  }

  if (
    moment(installmentsStartDateFromCsv).tz(timezone).isoWeekday() !==
    moment(client._meta.record['meeting day'], 'dddd').isoWeekday()
  ) {
    console.log(' ')
    console.log(' ')
    console.log(' ')
    console.log(
      `Error: Mismatch between the client group meeting day and the first installment collection date: Row ${client._meta.record['s/n']}. ${client.lastName}, ${client.firstName}`
    )
    console.log(' ')
    console.log(' ')
    console.log(' ')
    process.exit()
  }

  const installments = generateInstallments({
    principal: amount,
    duration: {
      value: numberOfInstallments,
      unit: frequencyToDurationUnit(clientGroup.meeting.frequency),
    },
    interestRateInPercents: interestRate,
    startDate: installmentsStartDateFromCsv,
    // floorTo: 500,
    overrideTarget: installmentAmount,
    toDate: true,
    holidays,
  })

  if (installments.some(i => i.total <= 0)) {
    console.log('')
    console.log(
      'Warning: Impossible installment amount for loan %s %s, %s',
      client._meta.record['id'],
      client.lastName,
      client.firstName
    )
  }

  const disbursedAmount = amount + (amount * interestRate) / 100
  const outstandingAmount = parseInt(
    client._meta.record['outstanding amount'].replace(/ /g, '').replace('-', 0)
  )

  let totalRealization =
    amount + (amount * interestRate) / 100 - outstandingAmount

  if (totalRealization > disbursedAmount) {
    console.warn('Warning: Realized amount is higher than disbursed amount!')
    debug(client)
    return
    // process.exit()
  }

  const numberFullyPaidInstallments =
    totalRealization /
    parseInt(client._meta.record['installment amount'].replace(/ /g, ''))

  const installmentsBeforeToday = installments.filter(installment =>
    moment(installment.due).tz(timezone).isSameOrBefore(importDate, 'day')
  )

  const futureInstallments = installments.slice(installmentsBeforeToday.length)

  for (let installment of installmentsBeforeToday) {
    if (installment.total <= totalRealization) {
      installment.realization = installment.total
      installment.target = installment.total
      installment.status = 'paid'
      totalRealization -= installment.total
    } else {
      if (totalRealization > 0) {
        installment.realization = totalRealization
        installment.target = installment.total
        totalRealization -= installment.total
      }
      installment.status = 'late'
      installment.wasLate = true
    }
  }

  if (totalRealization > 0) {
    debug(
      'Overpayment detected: row',
      Object.entries(client._meta.record)[0][1],
      client.firstName,
      client.lastName
    )
    debug('Paid in advance:', totalRealization)
    debug('Installment amount', installmentAmount)
    debug(
      'Total realization so far:',
      amount + (amount * interestRate) / 100 - outstandingAmount
    )
    debug('Fully paid installments', numberFullyPaidInstallments)
    debug(
      'Installments / meetings elapsed according to the schedule:',
      installmentsBeforeToday.length
    )
    debug('\n')
  }

  for (let i = futureInstallments.length - 1; i >= 0; i--) {
    const installment = futureInstallments[i]
    if (installment.total <= totalRealization) {
      installment.target = 0
      totalRealization -= installment.total
    } else {
      if (totalRealization > 0) {
        installment.target = installment.total - Math.floor(totalRealization)
        totalRealization -= installment.total
      }
    }
  }

  const realizedAmount = installments.reduce(
    (acc, installment) => acc + installment.realization,
    0
  )

  const loanStatus = disbursedAmount === realizedAmount ? 'repaid' : 'active'

  const cycleRaw = parseInt(client._meta.record['loan cycle'])

  const cycleBasedOnSecurityBalance =
    (parseInt(client._meta.record['security balance'].replace(/ /g, '')) *
      100) /
      amount ===
    loanProduct?.cashCollateral?.initialLoan
      ? 1
      : 2

  const cycle = isNaN(cycleRaw) ? cycleBasedOnSecurityBalance : cycleRaw

  const isLoanBeforeMarch2021 = moment
    .tz(client._meta.record['disbursement date'], 'DD/MM/YYYY', timezone)
    .isBefore('2021-03-01', 'day')

  const importedCashCollateralForTheInitialLoan = isLoanBeforeMarch2021
    ? 10
    : loanProduct?.cashCollateral?.initialLoan

  const importedCashCollateralForFurtherLoans = isLoanBeforeMarch2021
    ? 12.5
    : loanProduct?.cashCollateral?.furtherLoans

  const importedCashCollateral =
    cycle === 1
      ? importedCashCollateralForTheInitialLoan
      : importedCashCollateralForFurtherLoans

  const cashCollateral = !yamrc.currentRealmApp.isFakeData
    ? importedCashCollateral
    : 10

  const loan = {
    _id: new ObjectId(),
    code: client._meta.record['code']
      ? `L${2100 + parseInt(client._meta.record['code'])}`
      : generateLoanCode(data.loans.length),
    clientId: new ObjectId(client._id),
    cycle: cycle,
    cashCollateral,
    branchId,
    branchName,
    clientGroupId,
    clientGroupName: clientGroup.name,
    branchManagerId: branchManager._id,
    branchManagerName: [branchManager.lastName, branchManager.firstName].join(
      ', '
    ),
    loanOfficerId,
    loanOfficerName,
    loanInsurance: !yamrc.currentRealmApp.isFakeData
      ? loanProduct.loanInsurance
      : faker.random.arrayElement(loanProducts).loanInsurance,
    loanProductId,
    loanProductName,
    loanProcessingFee: !yamrc.currentRealmApp.isFakeData
      ? loanProduct.loanProcessingFee
      : faker.random.arrayElement(loanProducts).loanProcessingFee,
    duration: {
      value: numberOfInstallments,
      unit: frequencyToDurationUnit(clientGroup.meeting.frequency),
    },
    requestedAmount: amount,
    approvedAmount: amount,
    installments,
    interestRate,
    status: !yamrc.currentRealmApp.isFakeData
      ? loanStatus
      : faker.random.arrayElement(statuses), // TODO: will have more here
    applicationAt: !yamrc.currentRealmApp.isFakeData
      ? moment
          .tz(client._meta.record['disbursement date'], 'DD/MM/YYYY', timezone)
          .toDate()
      : new Date(),
    managerDecisionAt: !yamrc.currentRealmApp.isFakeData
      ? moment
          .tz(client._meta.record['disbursement date'], 'DD/MM/YYYY', timezone)
          .toDate()
      : new Date(),
    disbursementAt: !yamrc.currentRealmApp.isFakeData
      ? moment
          .tz(client._meta.record['disbursement date'], 'DD/MM/YYYY', timezone)
          .toDate()
      : new Date(),
  }

  return loan
}

const generateLoanProducts = () => {
  const products = [
    {
      _id: new ObjectId('607ec877425af75f4538fb78'),
      name: 'Small Loan 2020',
      gracePeriod: 5,
      cashCollateral: {
        initialLoan: 10,
        furtherLoans: 15,
      },
      loanInsurance: 1,
      firstLoanDisbursement: 14,
      riskCover:
        'LOP will be written-off and Ugx 125,000 cash payment for funeral',
      disbursement: 'Cash disbursement from branch',
      loanProcessingFee: {
        type: 'fixed',
        value: 1000,
      },
      durations: [12, 16, 20, 32, 40],
      initialLoan: [
        {
          duration: 12,
          from: 250000,
          to: 600000,
        },
        {
          duration: 16,
          from: 250000,
          to: 600000,
        },
        {
          duration: 20,
          from: 250000,
          to: 600000,
        },
        {
          duration: 32,
          from: 250000,
          to: 800000,
        },
        {
          duration: 40,
          from: 250000,
          to: 800000,
        },
      ],
      loanIncrementEachCycle: [
        {
          duration: 12,
          from: 75000,
          to: 200000,
        },
        {
          duration: 16,
          from: 75000,
          to: 200000,
        },
        {
          duration: 20,
          from: 75000,
          to: 200000,
        },
        {
          duration: 32,
          from: 75000,
          to: 200000,
        },
        {
          duration: 40,
          from: 75000,
          to: 200000,
        },
      ],
      serviceCharge: [
        {
          duration: 12,
          charge: 8,
        },
        {
          duration: 16,
          charge: 10,
        },
        {
          duration: 20,
          charge: 13,
        },
        {
          duration: 32,
          charge: 19,
        },
        {
          duration: 40,
          charge: 26,
        },
      ],
      advanceInstallments: [
        {
          duration: 12,
          installments: 2,
        },
        {
          duration: 16,
          installments: 3,
        },
        {
          duration: 20,
          installments: 4,
        },
        {
          duration: 32,
          installments: 5,
        },
        {
          duration: 40,
          installments: 7,
        },
      ],
      limits: [
        {
          duration: 12,
          limit: 2000000,
        },
        {
          duration: 16,
          limit: 2000000,
        },
        {
          duration: 20,
          limit: 2500000,
        },
        {
          duration: 32,
          limit: 2500000,
        },
        {
          duration: 40,
          limit: 2500000,
        },
      ],
      requiredGuarantors: {
        group: 1,
        family: 1,
      },
      requiredDocuments: {
        initialLoan: [
          {
            _id: new ObjectId(),
            name: 'Local Council certificate',
          },
        ],
        furtherLoans: [],
      },
      status: 'inactive',
    },
    {
      _id: new ObjectId('607ec87fa277b2e88bbe804c'),
      name: 'Small Loan',
      gracePeriod: 5,
      cashCollateral: {
        initialLoan: 10,
        furtherLoans: 15,
      },
      loanInsurance: 1,
      firstLoanDisbursement: 14,
      riskCover: 'LOP will be written-off and member savings will be returned',
      disbursement: 'Cash disbursement from branch',
      loanProcessingFee: {
        type: 'percentage',
        value: 1,
      },
      durations: [12, 16, 20, 32, 40],
      initialLoan: [
        {
          duration: 12,
          from: 250000,
          to: 600000,
        },
        {
          duration: 16,
          from: 250000,
          to: 600000,
        },
        {
          duration: 20,
          from: 250000,
          to: 600000,
        },
        {
          duration: 32,
          from: 250000,
          to: 800000,
        },
        {
          duration: 40,
          from: 250000,
          to: 800000,
        },
      ],
      loanIncrementEachCycle: [
        {
          duration: 12,
          from: 75000,
          to: 200000,
        },
        {
          duration: 16,
          from: 75000,
          to: 200000,
        },
        {
          duration: 20,
          from: 75000,
          to: 200000,
        },
        {
          duration: 32,
          from: 75000,
          to: 200000,
        },
        {
          duration: 40,
          from: 75000,
          to: 200000,
        },
      ],
      serviceCharge: [
        {
          duration: 12,
          charge: 8,
        },
        {
          duration: 16,
          charge: 10,
        },
        {
          duration: 20,
          charge: 13,
        },
        {
          duration: 32,
          charge: 19,
        },
        {
          duration: 40,
          charge: 26,
        },
      ],
      advanceInstallments: [
        {
          duration: 12,
          installments: 2,
        },
        {
          duration: 16,
          installments: 3,
        },
        {
          duration: 20,
          installments: 4,
        },
        {
          duration: 32,
          installments: 5,
        },
        {
          duration: 40,
          installments: 7,
        },
      ],
      limits: [
        {
          duration: 12,
          limit: 2000000,
        },
        {
          duration: 16,
          limit: 2000000,
        },
        {
          duration: 20,
          limit: 2500000,
        },
        {
          duration: 32,
          limit: 2500000,
        },
        {
          duration: 40,
          limit: 2500000,
        },
      ],
      requiredGuarantors: {
        group: 1,
        family: 1,
      },
      requiredDocuments: {
        initialLoan: [
          {
            _id: new ObjectId(),
            name: 'Local Council certificate',
          },
        ],
        furtherLoans: [],
      },
      status: 'active',
    },
  ]

  if (!yamrc.currentRealmApp.isFakeData) {
    products.push({
      _id: new ObjectId('607ec887dcc8add1361aad18'),
      name: 'Small Business Loan',
      gracePeriod: 5,
      cashCollateral: {
        initialLoan: 10,
        furtherLoans: 10,
      },
      loanInsurance: 1,
      firstLoanDisbursement: 21,
      riskCover:
        '50% of Loan outstanding write off and Ugx 125,000 cash payment for funeral.',
      disbursement:
        'Cash disbursement from the branch up to Ugx 1,500,000/= and Cheque disbursement above 1,500,000/= through account pay cheque.',
      loanProcessingFee: {
        type: 'fixed',
        value: 6000,
      },
      durations: [23, 43],
      initialLoan: [
        {
          duration: 23,
          from: 1000000,
          to: 2500000,
        },
        {
          duration: 43,
          from: 1000000,
          to: 3000000,
        },
      ],
      loanIncrementEachCycle: [
        {
          duration: 23,
          from: 300000,
          to: 800000,
        },
        {
          duration: 43,
          from: 500000,
          to: 1000000,
        },
      ],
      serviceCharge: [
        {
          duration: 23,
          charge: 15,
        },
        {
          duration: 43,
          charge: 29,
        },
      ],
      advanceInstallments: [
        {
          duration: 23,
          installments: 3,
        },
        {
          duration: 43,
          installments: 4,
        },
      ],
      limits: [
        {
          duration: 23,
          limit: 2500000,
        },
        {
          duration: 43,
          limit: 3000000,
        },
      ],
      requiredGuarantors: {
        group: 2,
        family: 2,
      },
      requiredDocuments: {
        initialLoan: [
          {
            _id: new ObjectId(),
            name: 'Local Council certificate',
          },
          {
            _id: new ObjectId(),
            name: 'Business license',
          },
          {
            _id: new ObjectId(),
            name: 'Bank statement (last 3 months for assessment)',
          },
          {
            _id: new ObjectId(),
            name: 'Post-dated cheque #1',
          },
          {
            _id: new ObjectId(),
            name: 'Post-dated cheque #2',
          },
          {
            _id: new ObjectId(),
            name: 'Post-dated cheque #3',
          },
        ],
        furtherLoans: [
          {
            _id: new ObjectId(),
            name: 'Local Council certificate',
          },
          {
            _id: new ObjectId(),
            name: 'Business license',
          },
          {
            _id: new ObjectId(),
            name: 'Bank statement (last 3 months for assessment)',
          },
          {
            _id: new ObjectId(),
            name: 'Post-dated cheque #1',
          },
          {
            _id: new ObjectId(),
            name: 'Post-dated cheque #2',
          },
          {
            _id: new ObjectId(),
            name: 'Post-dated cheque #3',
          },
        ],
      },
      status: 'active',
    })
  }

  return products
}

const generateSettings = () => {
  return [
    {
      _id: new ObjectId(),
      name: 'productFinancingLabel',
      value: 'Interest in the new offer',
    },
    {
      _id: new ObjectId(),
      name: 'productFinancingHelperText',
      value:
        'Umoja is considering offering products financed directly from loans. Spending 50% of the loan on products from Umoja would increase your loan amount limit by USh 10,000. You would have to pick up the product from the branch office. Would you be interested in such an offer when applying for another loan?',
    },
  ]
}

const generateForm = ({
  loanId,
  clientId,
  loanOfficerId,
  formType,
  status,
}) => {
  return {
    _id: new ObjectId(),
    clientId,
    loanOfficerId,
    formType,
    loanId,
    relatedFormId: new ObjectId(),
    content: {
      inspection: [
        {
          uri: '',
          lat: '',
          lng: '',
        },
        {
          uri: '',
          lat: '',
          lng: '',
        },
        {
          uri: '',
          lat: '',
          lng: '',
        },
      ],
      code: '',
      occupation: '',
      dateOfBirth: moment().toDate(),
      sex: '',
      maritalStatus: '',
      partnersConsent: true,
      fatherOrHusbandName: '',
      mobilePhoneNumber: '',
      nationalVoterIdNumber: '',
      nationalVoterIdPhoto: {
        uri: '',
        lat: '',
        lng: '',
      },
      photo: {
        uri: '',
        lat: '',
        lng: '',
      },
      loanRequirements: [
        {
          requirement: new ObjectId(),
          name: '',
          uri: '',
          lat: '',
          lng: '',
        },
      ],
      residence: {
        area: '',
        subcounty: '',
        county: '',
        district: '',
        notes: '',
      },
      work: {
        area: '',
        subcounty: '',
        county: '',
        district: '',
        notes: '',
      },
      debt: {
        amount: 0,
        source: '',
      },
      previousLoan: {
        amount: 0,
        cycle: '',
        purpose: '',
      },
      loan: {
        type: new ObjectId(),
        name: '',
        duration: 0,
        amount: 0,
        cycle: 0,
        interestRate: 0,
      },
      projects: ['', ''],
      utilization: {
        equipment: {
          cost: 0,
          value: 0,
          security: '',
        },
        workingCapital: {
          cost: 0,
          value: 0,
          security: '',
        },
        rent: {
          cost: 0,
          value: 0,
          security: '',
        },
        extension: {
          cost: 0,
          value: 0,
          security: '',
        },
        debtPayment: {
          cost: 0,
          value: 0,
          security: '',
        },
        other: {
          cost: 0,
          value: 0,
          security: '',
        },
      },
      forecast: {
        core: {
          monthlyIncome: 0,
          monthlyExpenditure: 0,
          comment: '',
        },
        other: {
          monthlyIncome: 0,
          monthlyExpenditure: 0,
          comment: '',
        },
      },
      guarantors: [
        {
          name: '',
          relation: '',
          nationalVoterIdNumber: '',
          nationalVoterIdPhoto: {
            uri: '',
            lat: '',
            lng: '',
          },
          photo: {
            uri: '',
            lat: '',
            lng: '',
          },
          signature: '',
        },
      ],
    },
    signatures: {
      client: '',
      employee: '',
    },
    locations: {
      start: {
        lat: '',
        lng: '',
      },
      submission: {
        lat: '',
        lng: '',
      },
      decision: {
        lat: '',
        lng: '',
      },
    },
    notes: '',
    startedAt: moment().toDate(),
    submittedAt: moment().toDate(),
    decidedAt: moment().toDate(),
    status,
  }
}

const generateForms = data => {
  const formsFromOneGroup = data.clients.slice(0, 3).map((client, index) => {
    return generateForm({
      clientId: client._id,
      loanOfficerId: data.users.find(user => user.role === 'loanOfficer')._id,
      formType: 'application',
      status: 'approved',
      loanId: data.loans[0]._id,
    })
  })

  const clientFromDifferentGroup = data.clients.find(
    client => client.clientGroupId !== data.clients[0].clientGroupId
  )

  const formFromDifferentGroup = generateForm({
    clientId: clientFromDifferentGroup._id,
    loanOfficerId: data.users.find(user => user.role === 'loanOfficer')._id,
    formType: 'application',
    status: 'approved',
    loanId: data.loans[1]._id,
  })

  return [...formsFromOneGroup, formFromDifferentGroup]
}

const generateHolidays = () => {
  return [
    {
      _id: new ObjectId(),
      name: 'Independence Day',
      startAt: moment('2020-10-09')
        .tz('Africa/Kampala')
        .startOf('day')
        .toDate(),
      endAt: moment('2020-10-09').tz('Africa/Kampala').endOf('day').toDate(),
      yearly: true,
      notes: 'Public holiday',
    },
    {
      _id: new ObjectId(),
      name: 'Christmas Holiday 2020',
      startAt: moment('2020-12-19')
        .tz('Africa/Kampala')
        .startOf('day')
        .toDate(),
      endAt: moment('2021-01-03').tz('Africa/Kampala').endOf('day').toDate(),
      yearly: false,
      notes: 'Umoja announced holiday',
    },
    {
      _id: new ObjectId(),
      name: 'National election day',
      startAt: moment('2021-01-13')
        .tz('Africa/Kampala')
        .startOf('day')
        .toDate(),
      endAt: moment('2021-01-14').tz('Africa/Kampala').endOf('day').toDate(),
      yearly: false,
    },
    {
      _id: new ObjectId(),
      name: 'Liberation Day',
      startAt: moment('2021-01-26')
        .tz('Africa/Kampala')
        .startOf('day')
        .toDate(),
      endAt: moment('2021-01-26').tz('Africa/Kampala').endOf('day').toDate(),
      yearly: true,
      notes: 'Public holiday',
    },
    {
      _id: new ObjectId(),
      name: 'Janani Luwum Day',
      startAt: moment('2021-02-16')
        .tz('Africa/Kampala')
        .startOf('day')
        .toDate(),
      endAt: moment('2021-02-16').tz('Africa/Kampala').endOf('day').toDate(),
      yearly: true,
      notes: 'Public holiday',
    },
    {
      _id: new ObjectId(),
      name: 'International Women’s Day',
      startAt: moment('2021-03-08')
        .tz('Africa/Kampala')
        .startOf('day')
        .toDate(),
      endAt: moment('2021-03-08').tz('Africa/Kampala').endOf('day').toDate(),
      yearly: true,
      notes: 'Public holiday',
    },
    {
      _id: new ObjectId(),
      name: 'Good Friday 2021',
      startAt: moment('2021-04-02')
        .tz('Africa/Kampala')
        .startOf('day')
        .toDate(),
      endAt: moment('2021-04-02').tz('Africa/Kampala').endOf('day').toDate(),
      yearly: false,
      notes: 'Public holiday',
    },
    {
      _id: new ObjectId(),
      name: 'Easter Holiday 2021',
      startAt: moment('2021-04-05')
        .tz('Africa/Kampala')
        .startOf('day')
        .toDate(),
      endAt: moment('2021-04-05').tz('Africa/Kampala').endOf('day').toDate(),
      yearly: false,
      notes: 'Public holiday',
    },
    {
      _id: new ObjectId(),
      name: 'President’s Swearing-in',
      startAt: moment('2021-05-12')
        .tz('Africa/Kampala')
        .startOf('day')
        .toDate(),
      endAt: moment('2021-05-12').tz('Africa/Kampala').endOf('day').toDate(),
      yearly: false,
      notes: 'Public holiday',
    },
    {
      _id: new ObjectId(),
      name: 'Eid Holiday',
      startAt: moment('2021-05-13')
        .tz('Africa/Kampala')
        .startOf('day')
        .toDate(),
      endAt: moment('2021-05-13').tz('Africa/Kampala').endOf('day').toDate(),
      yearly: false,
      notes: 'Depends on the Moon',
    },
    {
      _id: new ObjectId(),
      name: 'Martyrs’ Day',
      startAt: moment('2021-06-03')
        .tz('Africa/Kampala')
        .startOf('day')
        .toDate(),
      endAt: moment('2021-06-03').tz('Africa/Kampala').endOf('day').toDate(),
      yearly: true,
      notes: 'Public holiday',
    },
    {
      _id: new ObjectId(),
      name: 'National Heroes Day',
      startAt: moment('2021-06-09')
        .tz('Africa/Kampala')
        .startOf('day')
        .toDate(),
      endAt: moment('2021-06-09').tz('Africa/Kampala').endOf('day').toDate(),
      yearly: true,
      notes: 'Public holiday',
    },
    {
      _id: new ObjectId(),
      name: 'Eid Holiday',
      startAt: moment('2021-07-20')
        .tz('Africa/Kampala')
        .startOf('day')
        .toDate(),
      endAt: moment('2021-07-20').tz('Africa/Kampala').endOf('day').toDate(),
      yearly: false,
      notes: 'Depends on the Moon',
    },
  ]
}

module.exports = {
  generateCode,
  generateUsers,
  generateBranch,
  generateLoanOfficer,
  generateStaffMember,
  generateClient,
  generateClientGroup,
  generateClientGroupMeetings,
  generateLoanProducts,
  generateLoan,
  generateForms,
  generateSettings,
  generateHolidays,
}
