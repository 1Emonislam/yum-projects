const { getDatabaseConnection, disconnect } = require('./client')
const { hideBin } = require('yargs/helpers')
const { ObjectId } = require('mongodb')
const { Signale } = require('signale')
const yargs = require('yargs/yargs')
const moment = require('moment-timezone')

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

const timezone = process.env.TIMEZONE || 'Africa/Kampala'

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  if (!argv.branchId) {
    console.log()
    interactive.error('Please specify --branchId <id>')
    console.log()
    process.exit(1)
  }

  if (!argv.date) {
    console.log()
    interactive.error('Please specify --date <DD.MM.YYYY>')
    console.log()
    process.exit(1)
  }

  const branchId = new ObjectId(argv.branchId.trim())
  const date = argv.date.trim()

  console.log('Report branchID', branchId)
  console.log('Report date', date)
  console.log(' ')

  const dateFilter = {
    $gte: moment(date, 'DD.MM.YYYY').tz(timezone).startOf('day').toDate(),
    $lte: moment(date, 'DD.MM.YYYY').tz(timezone).endOf('day').toDate(),
  }

  const db = await getDatabaseConnection(argv.env)

  const clientGroupIds = await db
    .collection('clientGroups')
    .find({
      branchId,
    })
    .toArray()

  const clientGroupsMeetings = await db
    .collection('clientGroupsMeetings')
    .find({
      clientGroupId: { $in: clientGroupIds.map(cg => cg._id) },
      scheduledAt: dateFilter,
    })
    .toArray()

  const activeLoansFromBranchWithInstallmentsToday = await db
    .collection('loans')
    .find(
      {
        installments: {
          $elemMatch: {
            due: dateFilter,
          },
        },
        status: 'active',
        branchId,
      },
      { _id: 1, installments: 1 }
    )
    .toArray()

  const todaysRealizationFromNonLoanOfficersInstallmentDaysEvents = await db
    .collection('events')
    .find({
      transactionName: 'COLLECT_INSTALLMENT',
      meta: 'Collection as a non-Loan Officer',
      'payload.loanId': {
        $in: activeLoansFromBranchWithInstallmentsToday.map(loan => loan._id),
      },
      'payload.branchId': ObjectId(branchId),
      'payload.todaysRealizationCash': { $gt: 0 },
      'payload.cashCollectionDay': 'installmentDays',
    })
    .toArray()

  const todaysRealizationFromNonLoanOfficersInstallmentDaysEventsFiltered =
    todaysRealizationFromNonLoanOfficersInstallmentDaysEvents.filter(event => {
      const { loanId, installmentId } = event.payload

      const loan = activeLoansFromBranchWithInstallmentsToday.find(
        loan => String(loan._id) === String(loanId)
      )

      if (loan) {
        const installment = loan.installments.find(
          installment => String(installment._id) === String(installmentId)
        )

        if (installment) {
          return true
        }
      }

      return false
    })

  const editedLoansFromClientGroupMeetings = await db
    .collection('loans')
    .find(
      {
        _id: {
          $in: clientGroupsMeetings.flatMap(meeting =>
            meeting.installments.map(installment => installment.loanId)
          ),
        },
        edited: true,
      },
      {
        _id: 1,
        installments: 1,
      }
    )
    .toArray()

  const edits = await db
    .collection('events')
    .find(
      {
        type: 'update',
        obj: 'loan',
        objId: {
          $in: editedLoansFromClientGroupMeetings.map(loan => loan._id),
        },
        transactionName: 'EDIT_LOAN',
      },
      {
        objId: 1,
        timestamp: 1,
      }
    )
    .sort({ timestamp: -1 })
    .toArray()

  // log edited loans
  let variance = 0
  for (const meeting of clientGroupsMeetings) {
    const meetingDay = moment(meeting.createdAt).tz(timezone)
    const { installments = [] } = meeting

    installments
      .filter(installmentFromMeeting => {
        const editedLoan = editedLoansFromClientGroupMeetings.find(
          loan => String(loan._id) === String(installmentFromMeeting.loanId)
        )

        // Filter out installments that are affected by BM collection
        // to avoid counting them twice
        const collectionFromNonLoanOfficerIndex =
          todaysRealizationFromNonLoanOfficersInstallmentDaysEventsFiltered.findIndex(
            event =>
              String(event?.payload?.loanId) ===
              String(installmentFromMeeting.loanId)
          )

        const collectionFromNonLoanOfficer =
          collectionFromNonLoanOfficerIndex !== -1

        if (collectionFromNonLoanOfficer) {
          return false
        }

        // Filter out installments that are out of date on a given day
        // due to a change in the installment schedule
        // triggered by a loan edit
        if (editedLoan) {
          const installmentIndex = editedLoan.installments.findIndex(
            installmentFromEditedLoan =>
              moment(installmentFromEditedLoan.due)
                .tz(timezone)
                .isSame(meetingDay, 'day')
          )

          const noInstallmentScheduledForTodayInEditedLoan =
            installmentIndex === -1

          const noLateInstallments = !editedLoan.installments.some(
            installment => {
              if (
                moment(installment.due).tz(timezone).isBefore(meetingDay, 'day')
              ) {
                if (installment?.realization || 0 < installment.target) {
                  return true
                }
              }

              return false
            }
          )

          if (
            noInstallmentScheduledForTodayInEditedLoan &&
            noLateInstallments
          ) {
            return false
          }
        }

        return true
      })
      .map(installment => {
        const editedLoan = editedLoansFromClientGroupMeetings.find(
          l => l._id.toString() === installment.loanId.toString()
        )
        if (editedLoan) {
          const lastEditEvent = edits.find(
            edit => String(edit.objId) === String(editedLoan._id)
          )

          if (lastEditEvent) {
            const lastEditDay = moment(lastEditEvent.timestamp).tz(timezone)

            const meetingBeforeLastEdit = lastEditDay.isAfter(meetingDay, 'day')

            if (meetingBeforeLastEdit) {
              const installmentFromEditedLoan = editedLoan.installments.find(
                installmentFromEditedLoan =>
                  moment(installmentFromEditedLoan.due)
                    .tz(timezone)
                    .isSame(meetingDay, 'day')
              )

              if (installmentFromEditedLoan) {
                const cahValue =
                  (installmentFromEditedLoan?.realization || 0) +
                  (installmentFromEditedLoan.total -
                    installmentFromEditedLoan.target)

                const diff = installment.todaysRealization - cahValue

                variance += diff

                console.log(`[LAST EDIT DAY]: ${lastEditDay}`)
                console.log(`[EDITED LOAN REALIZATION]: ${cahValue}`)
                console.log(
                  `[MEETING REALIZATION]: ${installment.todaysRealization}`
                )
                console.log('[DIFF]:', diff)
                console.log(
                  `[LOAN URL]: https://app.yamafrica.com/clients/${installment.clientId}/loans/${installment.loanId}`
                )
                console.log(
                  '-------------------------------------------------------'
                )
              }
            }
          }
        }
      })
  }

  console.log(' ')
  console.log('[TOTAL DIFFERENCE]', variance)

  await disconnect()
}

main()
