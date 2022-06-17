const _ = require('lodash')
const { getDatabaseConnection, disconnect } = require('./../client')
const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const path = require('path')
const yargs = require('yargs/yargs')
const moment = require('moment-timezone')
const fs = require('fs')

const timezone = 'Africa/Kampala'

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

const timestamp = new Date()

const migration = path.parse(__filename).name

const isLoanActive = (loan = {}) => {
  const { approvedAmount = null } = loan
  if (approvedAmount === null) {
    return false
  }
  const { installments = [] } = loan
  const active = installments.some(
    installment =>
      installment.status === 'late' || installment.status === 'future'
  )
  return active
}

const getLoanWithTodayInstallments = loan => {
  const { installments = [] } = loan

  const hasInstallmentWithSameDay = installments.some(installment =>
    moment(installment.due).tz(timezone).isSame(moment().tz(timezone), 'day')
  )

  const hasNoFutureInstallment = installments.every(
    installment => installment.status !== 'future'
  )
  const hasSomeLateInstallment = installments.some(
    installment => installment.status === 'late'
  )

  return (
    hasInstallmentWithSameDay ||
    (hasNoFutureInstallment && hasSomeLateInstallment)
  )
}

const getInstallmentStatusForMeetingFromLoan = loan => {
  const { _id: loanId, approvedAmount, installments = [], clientId } = loan
  let currentInstallment = installments.find(installment =>
    moment(installment.due).tz(timezone).isSame(moment().tz(timezone), 'day')
  )
  if (!currentInstallment) {
    currentInstallment = installments
      .reverse()
      .find(installment => installment.status === 'late')
  }
  const cumulativeRealization = installments.reduce((acc, installment = {}) => {
    const { realization = 0, total, target } = installment
    return acc + realization + (total - target)
  }, 0)
  const installment =
    currentInstallment.status === 'late' ? 0 : currentInstallment.target
  const overdueInstallments = installments.filter(
    installment => installment.status === 'late'
  )
  const sums = overdueInstallments.reduce(
    (acc, installment) => {
      return {
        target: acc.target + (installment.target || 0),
        realization: acc.realization + (installment.realization || 0),
      }
    },
    {
      target: 0,
      realization: 0,
    }
  )

  const overdue = sums.target - sums.realization

  const disbursedAmount = installments?.reduce(
    (acc, installment) => acc + installment.total,
    0
  )

  const openingBalance = disbursedAmount - cumulativeRealization

  return {
    _id: currentInstallment._id,
    approvedAmount,
    clientId,
    cumulativeRealization,
    durationValue: loan.duration.value,
    durationUnit: loan.duration.unit,
    installment,
    loanId,
    openingBalance,
    overdue,
    overdueInstallments: overdueInstallments.length,
  }
}

const correctStatuses = loan => {
  const moment = require('moment-timezone')
  const now = moment().startOf('day')
  let { installments = [] } = loan
  const newInstallments = installments.map(installment => {
    const { due, status } = installment
    const momentDue = moment(due)
    let newStatus = status

    if (momentDue.isBefore(now) && status !== 'paid') {
      newStatus = 'late'
    } else if (momentDue.isSameOrAfter(now) && status !== 'paid') {
      newStatus = 'future'
    }

    return {
      ...installment,
      status: newStatus,
    }
  })

  return {
    ...loan,
    installments: newInstallments,
  }
}

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  const db = await getDatabaseConnection(argv.env)

  const eventsWithLoanIds = await db
    .collection('events')
    .find(
      {
        migration: '1650631699-timezones',
      },
      {
        objId: 1,
      }
    )
    .toArray()

  console.log('eventsWithLoanIds:', eventsWithLoanIds.length)

  const loans = await db
    .collection('loans')
    .find(
      {
        _id: { $in: eventsWithLoanIds.map(event => event.objId) },
      },
      {
        clientId: 1,
      }
    )
    .toArray()

  console.log('loans:', loans.length)

  const clients = await db
    .collection('clients')
    .find({
      _id: { $in: loans.map(loan => loan.clientId) },
    })
    .toArray()

  console.log('clients:', clients.length)

  const clientGroups = await db
    .collection('clientGroups')
    .find({
      _id: { $in: clients.map(client => client.clientGroupId) },
      'meeting.dayOfWeek': moment().tz(timezone).isoWeekday(),
    })
    .toArray()

  console.log('clientGroups:', clientGroups.length)

  const clientGroupsMeetings = await db
    .collection('clientGroupsMeetings')
    .find({
      clientGroupId: { $in: clientGroups.map(clientGroup => clientGroup._id) },
      scheduledAt: {
        $gte: moment().tz(timezone).startOf('day').toDate(),
        $lte: moment().tz(timezone).endOf('day').toDate(),
      },
    })
    .toArray()

  console.log('clientGroupsMeetings:', clientGroupsMeetings.length)

  let clientGroupsMeetingsWithoutInstallments = 0

  clientGroupsMeetings.forEach(m => {
    if (m.installments.length === 0) {
      clientGroupsMeetingsWithoutInstallments++
    }
  })

  console.log(
    'clientGroupsMeetingsWithoutInstallments:',
    clientGroupsMeetingsWithoutInstallments
  )

  const relatedClients = await db
    .collection('clients')
    .find({
      clientGroupId: {
        $in: clientGroupsMeetings.map(meeting => meeting.clientGroupId),
      },
    })
    .toArray()

  console.log('relatedClients:', relatedClients.length)

  const relatedLoans = await db
    .collection('loans')
    .find({
      clientId: { $in: relatedClients.map(client => client._id) },
      status: 'active',
    })
    .toArray()

  console.log('relatedLoans:', relatedLoans.length)

  // loans[0].installments.forEach(installment => {
  //   if (
  //     moment(installment.due).format('HH:mm') !== '21:59' &&
  //     moment(installment.due).format('HH:mm') !== '22:59'
  //   ) {
  //     console.log(
  //       '!',
  //       moment(installment.due).format('HH:mm'),
  //       installment.due,
  //       '->',
  //       moment(installment.due)
  //         .tz(timezone)
  //         .subtract(1, 'day')
  //         .endOf('day')
  //         .milliseconds(0)
  //         .toDate()
  //     )
  //   } else {
  //     console.log(moment(installment.due).format('HH:mm'), installment.due)
  //   }
  //   // if (moment(installment.due).format('HH:mm') !== '21:59') {
  //   //   installment.due = moment(installment.due)
  //   //     .tz(timezone)
  //   //     .endOf('day')
  //   //     .milliseconds(0)
  //   //     .toDate()
  //   // }
  // })

  // process.exit()

  let events = []

  for (let [index, meeting] of clientGroupsMeetings.entries()) {
    // console.log(
    //   `Meeting ${index + 1}/${clientGroupsMeetings.length} (${meeting._id})…`
    // )

    const installments = []

    meeting.installments.forEach(installment => {
      installments.push(installment)
    })

    const loans = relatedLoans.filter(loan => {
      const test = relatedClients.find(
        client =>
          String(client._id) === String(loan.clientId) &&
          String(client.clientGroupId) === String(meeting.clientGroupId)
      )

      if (test) {
        return true
      }

      return false
    })

    console.log('loans:', loans.length, meeting.clientGroupId)

    const newInstallments = loans
      .map(correctStatuses)
      .filter(isLoanActive)
      .filter(getLoanWithTodayInstallments)
      .map(getInstallmentStatusForMeetingFromLoan)

    newInstallments.forEach(installment => {
      const test = installments.find(
        i => String(i.loanId) === String(installment.loanId)
      )

      if (!test) {
        installments.push(installment)
      }
    })

    if (JSON.stringify(meeting.installments) !== JSON.stringify(installments)) {
      events.push({
        _id: new ObjectId(),
        type: 'update',
        obj: 'clientGroupMeeting',
        objId: meeting._id,
        payload: {
          installments,
        },
        timestamp,
        migration,
      })
    }
  }

  // Stats

  console.log('')

  console.log(events.length, 'events to send to MongoDB')

  console.log('')

  // Log

  // fs.writeFile(
  //   './' + migration + '.json',
  //   JSON.stringify(events),
  //   'utf8',
  //   err => {
  //     if (err) {
  //       console.log(`Error writing file: ${err}`)
  //     }
  //   }
  // )

  // Save to Mongo

  if (events.length > 0) {
    console.log('Inserting…')

    await db.collection('events').insertMany(events)

    await Promise.all(
      events.map(event =>
        db
          .collection(
            event.obj
              .replace('Transaction', 'Balance')
              .replace('clientGroupMeeting', 'clientGroupsMeeting') + 's'
          )
          .updateOne(
            { _id: event.objId },
            {
              $set: {
                ..._.omit(event.payload, ['_id', 'createdAt']),
                updatedAt: event.timestamp,
              },
            }
          )
      )
    )
  }

  await disconnect()
}

main()
