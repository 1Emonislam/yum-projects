const { ObjectId } = require('mongodb')
const moment = require('moment-timezone')

const timezone = process.env.TIMEZONE

// Fees defined by Umoja

const ADMISSION_SMALL_LOAN_FEE = 2000
const ADMISSION_SMALL_BUSINESS_LOAN_FEE = 4000
const MEMBERSHIP_RENEWAL_FEE = 1000
const PASSBOOK_FEE = 2000

// Helper function

const sum = (acc = 0, value = 0) => acc + value

// initCashAtHandReport

const initCashAtHandReport = async (
  _,
  { input: { branchId: branchIdString, date } },
  { dataSources },
  { detailedBreakdown = false } = {}
) => {
  /* ------------------------------------------------------------------------ */
  /*                            Table of contents                             */
  /* ------------------------------------------------------------------------ */
  /* - Setup                                                                  */
  /* - Queries                                                                */
  /* - Filters                                                                */
  /* - Reducers                                                               */
  /* - Wrap-up                                                                */
  /* ------------------------------------------------------------------------ */

  /* ------------------------------------------------------------------------ */
  /*                                 Setup                                    */
  /* ------------------------------------------------------------------------ */

  // Translate branch ID from string to ObjectId for use in MongoDB queries

  const branchId = new ObjectId(branchIdString)

  // Prepare the time filter for MongoDB queries
  //
  // We use two different Moment.js objects here to avoid modifying any of them in the rest of the file

  const todayFilter = {
    $gte: moment(date, 'DD.MM.YYYY').tz(timezone).startOf('day').toDate(),
    $lte: moment(date, 'DD.MM.YYYY').tz(timezone).endOf('day').toDate(),
  }

  // A helper function used for passbooks provided to active clients (passbooksProvidedToActiveClients)
  //
  // TODO: Refactor

  const asyncFilter = async (arr, predicate) =>
    Promise.all(arr.map(predicate)).then(results =>
      arr.filter((_v, index) => results[index])
    )

  /* ------------------------------------------------------------------------ */
  /*                                 Queries                                  */
  /* ------------------------------------------------------------------------ */

  const branch = await dataSources.branches.collection.findOne({
    _id: branchId,
  })

  // Every branch has an initial opening balance for CAH defined in the database

  const initOpeningBalance = branch.initOpeningBalance || 0

  // Find the previous CAH report (needed for the opening cash at hand value)

  const cashAtHandForm = await dataSources.cashAtHandForms.collection
    .find({
      branchId,
      dateIso: {
        $lt: moment(date, 'DD.MM.YYYY').tz(timezone).startOf('day').toDate(),
      },
    })
    .sort({ dateIso: -1 })
    .limit(1)
    .toArray()

  const closingBalance = cashAtHandForm?.[0]?.closingBalance ?? null

  // Opening cash at hand

  const openingBalance =
    closingBalance !== null
      ? closingBalance
      : initOpeningBalance
      ? initOpeningBalance
      : 0

  // Helper queries that will be needed below

  const clientGroups = await dataSources.clientGroups.collection
    .find(
      {
        branchId,
      },
      { projection: { _id: 1 } }
    )
    .toArray()

  const clientGroupIds = clientGroups.map(group => group._id)

  const clients = await dataSources.clients.collection
    .find(
      { clientGroupId: { $in: clientGroupIds } },
      { projection: { _id: 1 } }
    )
    .toArray()

  const clientIds = clients.map(client => client._id)

  // Receipts: Admission and passbook fees

  const clientsAdmissioned = await dataSources.clients.collection
    .find({
      _id: { $in: clientIds },
      $or: [{ admissionAt: todayFilter }, { addedAt: todayFilter }],
    })
    .toArray()

  const clientsWithMembershipRenewals = await dataSources.events.collection
    .find({
      type: 'update',
      obj: 'client',
      objId: { $in: clientIds },
      'payload.lastRenewalAt': todayFilter,
      'payload.code': { $exists: false },
      'payload.status': { $exists: false },
    })
    .toArray()

  const clientsReactivated = await dataSources.clients.collection
    .find({
      clientGroupId: { $in: clientGroupIds },
      lastRenewalAt: todayFilter,
    })
    .toArray()

  const clientsAdded = await dataSources.clients.collection
    .find({
      _id: { $in: clientIds },
      addedAt: todayFilter,
    })
    .toArray()

  const passbooksProvided = await dataSources.events.collection
    .find({
      type: 'update',
      obj: 'client',
      objId: { $in: clientIds },
      'payload.passbook': true,
      timestamp: todayFilter,
    })
    .toArray()

  // Receipts: Passbook fees (still)
  //
  // Find events that indicate that a client:
  // a) received a passbook
  // b) lost it (their passbook was marked as missing in the mobile app)
  // c) received another passbook
  //
  // TODO: Refactor
  const passbooksProvidedToActiveClients = await asyncFilter(
    passbooksProvided,
    async event => {
      const previousPassbookRelatedEvent =
        await dataSources.events.collection.findOne({
          type: 'update',
          obj: 'client',
          objId: event.objId,
          $or: [
            { payload: { passbook: true } },
            { payload: { passbook: false } },
          ],
          timestamp: { $gt: event.timestamp },
        })

      if (previousPassbookRelatedEvent) {
        if (previousPassbookRelatedEvent.payload.passbook === false) {
          return true
        }
      }

      return false
    }
  )

  // The query below is used in 3 contexts:
  // Receipts: Loan processing fees
  // Receipts: Loan insurance
  // Payments: Loan disbursements

  const loansDisbursedToday = await dataSources.loans.collection
    .find({
      branchId,
      disbursementAt: todayFilter,
      $or: [
        {
          disbursementMethod: { $exists: false },
        },
        {
          disbursementMethod: 'cash',
        },
      ],
    })
    .toArray()

  // Receipts: Today's realizations

  const clientGroupsMeetings = await dataSources.clientGroupsMeetings.collection
    .find({
      clientGroupId: { $in: clientGroupIds },
      createdAt: todayFilter,
    })
    .toArray()

  const activeLoansFromBranchWithInstallmentsToday =
    await dataSources.loans.collection
      .find(
        {
          installments: {
            $elemMatch: {
              due: todayFilter,
            },
          },
          status: 'active',
          branchId,
        },
        { _id: 1, installments: 1 }
      )
      .toArray()

  const todaysRealizationFromNonLoanOfficersTodayEvents =
    await dataSources.events.collection
      .find({
        transactionName: 'COLLECT_INSTALLMENT',
        meta: 'Collection as a non-Loan Officer',
        'payload.branchId': ObjectId(branchId),
        'payload.todaysRealizationCash': { $gt: 0 },
        'payload.cashCollectionDay': 'today',
        timestamp: todayFilter,
      })
      .toArray()

  const todaysRealizationFromNonLoanOfficersInstallmentDaysEvents =
    await dataSources.events.collection
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

  const editedLoansFromClientGroupMeetings = await dataSources.loans.collection
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

  const edits = await dataSources.events.collection
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

  const editedLoansOutsideOfClientGroupMeetings =
    await dataSources.loans.collection
      .find(
        {
          _id: {
            $nin: clientGroupsMeetings.flatMap(meeting =>
              meeting.installments.map(installment => installment.loanId)
            ),
          },
          installments: {
            $elemMatch: {
              due: todayFilter,
            },
          },
          status: 'active',
          edited: true,
          branchId,
        },
        {
          _id: 1,
          installments: 1,
        }
      )
      .toArray()

  const todaysRealizationFromNonLoanOfficersLegacyEvents =
    await dataSources.events.collection
      .find({
        transactionName: 'COLLECT_INSTALLMENT',
        meta: 'Collection as a non-Loan Officer',
        'payload.branchId': ObjectId(branchId),
        'payload.todaysRealizationCash': { $gt: 0 },
        'payload.cashCollectionDay': { $exists: false },
        timestamp: todayFilter,
      })
      .toArray()

  // Receipts: Security deposits

  const securityPaymentsHistory = await dataSources.securityBalances.collection
    .find({
      branchId: ObjectId(branchId),
      date: todayFilter,
      comment: 'Loan disbursement',
    })
    .toArray()

  // Payments: Loan disbursements: Search for "Payments: Loan disbursements" above

  // Payments: Security withdrawals

  const securityWithdrawalsHistory =
    await dataSources.securityBalances.collection
      .find({
        branchId: ObjectId(branchId),
        date: todayFilter,
        comment: { $ne: 'Loan disbursement' },
      })
      .toArray()

  /* ------------------------------------------------------------------------ */
  /*                                 Filters                                  */
  /* ------------------------------------------------------------------------ */

  // Return only events about BM collections with:
  // - Mode: Repayment
  // - Source: Cash
  // - Cash collection day: On the installment day
  // - Loan: Active
  // - Installment today: True

  const todaysRealizationFromNonLoanOfficersInstallmentDaysEventsFiltered =
    todaysRealizationFromNonLoanOfficersInstallmentDaysEvents.filter(event => {
      const { loanId, installmentId } = event.payload

      const loan = activeLoansFromBranchWithInstallmentsToday.find(
        loan => String(loan._id) === String(loanId)
      )

      if (loan) {
        const installment = loan.installments.find(
          installment =>
            String(installment._id) === String(installmentId) &&
            moment(installment.due)
              .tz(timezone)
              .isSame(moment(date, 'DD.MM.YYYY').tz(timezone), 'day')
        )

        if (installment) {
          return true
        }
      }

      return false
    })

  /* ------------------------------------------------------------------------ */
  /*                                Reducers                                  */
  /* ------------------------------------------------------------------------ */

  // Receipts: Admission fees

  const admissionFeesNewClients =
    clientsAdmissioned
      .map(client =>
        client.admission.smallBusinessLoan
          ? ADMISSION_SMALL_BUSINESS_LOAN_FEE
          : ADMISSION_SMALL_LOAN_FEE
      )
      .reduce(sum, 0) || 0

  const membershipRenewals =
    clientsWithMembershipRenewals
      .map(() => MEMBERSHIP_RENEWAL_FEE)
      .reduce(sum, 0) || 0

  const admissionFeesReactivatedClients =
    clientsReactivated
      .map(client =>
        client.admission.smallBusinessLoan
          ? ADMISSION_SMALL_BUSINESS_LOAN_FEE
          : ADMISSION_SMALL_LOAN_FEE
      )
      .reduce(sum, 0) || 0

  // Receipts: Passbook fees

  const passbookFeesAddedClients =
    clientsAdded.map(() => PASSBOOK_FEE).reduce(sum, 0) || 0

  const passbookFeesActiveClients =
    passbooksProvidedToActiveClients.map(() => PASSBOOK_FEE).reduce(sum, 0) || 0

  const passbookFeesReactivatedClients =
    clientsReactivated.map(() => PASSBOOK_FEE).reduce(sum, 0) || 0

  // Receipts: Loan processing fees

  const loanProcessingFees = loansDisbursedToday
    .map(loan => {
      if (loan.loanProcessingFee.type === 'fixed') {
        return loan.loanProcessingFee.value
      } else if (loan.loanProcessingFee.type === 'percentage') {
        return loan.approvedAmount * (loan.loanProcessingFee.value / 100)
      } else {
        throw new Error('Unknown loan processing fee type')
      }
    })
    .reduce(sum, 0)

  // Receipts: Loan insurance

  const loanInsurance = loansDisbursedToday
    .map(loan => loan.approvedAmount * (loan.loanInsurance / 100))
    .reduce(sum, 0)

  // Receipts: Today's realizations

  const todaysRealizationFromNonLoanOfficersToday =
    todaysRealizationFromNonLoanOfficersTodayEvents
      .map(event => event?.payload?.todaysRealizationCash || 0)
      .reduce(sum, 0)

  const todaysRealizationFromNonLoanOfficersInstallmentDays =
    todaysRealizationFromNonLoanOfficersInstallmentDaysEventsFiltered
      .map(event => {
        const { loanId, installmentId } = event.payload

        const loan = activeLoansFromBranchWithInstallmentsToday.find(
          loan => String(loan._id) === String(loanId)
        )

        if (loan) {
          const installment = loan.installments.find(
            installment => String(installment._id) === String(installmentId)
          )

          if (installment) {
            return (
              (installment?.realization || 0) +
              (installment.total - installment.target)
            )
          }
        }

        return 0
      })
      .reduce(sum, 0)

  const todaysRealizationsFromClientGroupMeetings = clientGroupsMeetings
    .map(clientGroupsMeeting => {
      const { installments = [] } = clientGroupsMeeting

      const meetingDay = moment(clientGroupsMeeting.createdAt).tz(timezone)

      return installments
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
                  moment(installment.due)
                    .tz(timezone)
                    .isBefore(meetingDay, 'day')
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
        .map(installmentFromMeeting => {
          const editedLoan = editedLoansFromClientGroupMeetings.find(
            loan => String(loan._id) === String(installmentFromMeeting.loanId)
          )

          // If the loan was changed after the meeting,
          // overwrite the installment from the meeting
          // with the installment from the loan object

          if (editedLoan) {
            const lastEditEvent = edits.find(
              edit => String(edit.objId) === String(editedLoan._id)
            )

            if (lastEditEvent) {
              const lastEditDay = moment(lastEditEvent.timestamp).tz(timezone)

              const meetingBeforeLastEdit = lastEditDay.isAfter(
                meetingDay,
                'day'
              )

              if (meetingBeforeLastEdit) {
                const installmentFromEditedLoan = editedLoan.installments.find(
                  installmentFromEditedLoan =>
                    moment(installmentFromEditedLoan.due)
                      .tz(timezone)
                      .isSame(meetingDay, 'day')
                )

                if (installmentFromEditedLoan) {
                  return (
                    (installmentFromEditedLoan?.realization || 0) +
                    (installmentFromEditedLoan.total -
                      installmentFromEditedLoan.target)
                  )
                }

                return 0
              }
            }
          }

          return installmentFromMeeting.todaysRealization
        })
        .reduce(sum, 0)
    })
    .reduce(sum, 0)

  const todaysRealizationFromEditedLoans =
    editedLoansOutsideOfClientGroupMeetings
      .map(loan => {
        const installmentFromEditedLoan = loan.installments.find(installment =>
          moment(installment.due)
            .tz(timezone)
            .isSame(moment(date, 'DD.MM.YYYY').tz(timezone), 'day')
        )

        return installmentFromEditedLoan?.realization || 0
      })
      .reduce(sum, 0)

  const todaysRealizationFromNonLoanOfficersLegacy =
    todaysRealizationFromNonLoanOfficersLegacyEvents
      .map(event => event?.payload?.todaysRealizationCash || 0)
      .reduce(sum, 0)

  // Receipts: Security deposits

  const securityPayments = securityPaymentsHistory
    .map(security => security.change)
    .reduce(sum, 0)

  // Payments: Loan disbursement

  const loanDisbursements = loansDisbursedToday
    .map(loan => loan.approvedAmount)
    .reduce(sum, 0)

  // Payments: Security withdrawals

  const securityWithdrawals = securityWithdrawalsHistory
    .filter(
      security =>
        security.closingSecurityBalance < security.openingSecurityBalance
    )
    .map(security => security.change * -1)
    .reduce(sum, 0)

  /* ------------------------------------------------------------------------ */
  /*                                 Wrap-up                                  */
  /* ------------------------------------------------------------------------ */

  // Group the values according to the UI of the web app

  const admissionFees =
    admissionFeesNewClients +
    admissionFeesReactivatedClients +
    membershipRenewals

  const passbookFees =
    passbookFeesAddedClients +
    passbookFeesActiveClients +
    passbookFeesReactivatedClients

  const todaysRealizationFromNonLoanOfficers =
    todaysRealizationFromNonLoanOfficersLegacy +
    todaysRealizationFromNonLoanOfficersToday +
    todaysRealizationFromNonLoanOfficersInstallmentDays

  const todaysRealizations =
    todaysRealizationsFromClientGroupMeetings +
    todaysRealizationFromNonLoanOfficers +
    todaysRealizationFromEditedLoans

  const loanRelatedFundsReceived =
    admissionFees +
    passbookFees +
    todaysRealizations +
    loanInsurance +
    securityPayments +
    loanProcessingFees

  // Formulate the conditional response for tools/cahBreakdown.js

  if (detailedBreakdown) {
    return {
      admissionFees,
      loanDisbursements,
      loanInsurance,
      loanProcessingFees,
      passbookFees,
      securityPayments,
      todaysRealizations,
    }
  }

  // Meta for debug purposes

  const meta = JSON.stringify({
    admissionFeesNewClients,
    admissionFeesReactivatedClients,
    membershipRenewals,
    passbookFeesAddedClients,
    passbookFeesActiveClients,
    passbookFeesReactivatedClients,
    todaysRealizationFromNonLoanOfficersLegacy,
    todaysRealizationFromNonLoanOfficersToday,
    todaysRealizationFromNonLoanOfficersInstallmentDays,
    todaysRealizationsFromClientGroupMeetings,
    todaysRealizationFromNonLoanOfficers,
    todaysRealizationFromEditedLoans,
  })

  // Formulate the response for the web app

  const initValues = {
    admissionFees,
    loanDisbursements,
    loanInsurance,
    loanProcessingFees,
    loanRelatedFundsReceived,
    openingBalance,
    passbookFees,
    securityPayments,
    securityWithdrawals,
    todaysRealizations,
    meta,
  }

  return initValues
}

module.exports = initCashAtHandReport
