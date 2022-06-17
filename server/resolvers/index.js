const { branch, branches, branchId } = require('./branches')
const {
  canCloseCashAtHandReport,
  cashAtHandForm,
  exportCashAtHandReport,
  initCashAtHandReport,
  openCashAtHandReport,
} = require('./cashAtHandForms')
const {
  cashierId,
  client,
  clientId,
  clients,
  clientsCount,
  clientsInspections,
  moveClientToAnotherClientGroup,
  presidentId,
  secretaryId,
} = require('./clients')
const {
  clientGroup,
  clientGroupId,
  clientGroups,
  clientGroupsCount,
  clientGroupWithStats,
  todayClientGroups,
} = require('./clientGroups')
const {
  clientGroupsMeeting,
  clientGroupsMeetings,
  collectInstallment,
  todayMeeting,
  todayRealizations,
} = require('./clientGroupsMeetings')
const { addEvent } = require('./events')
const { feedbackId } = require('./feedback')
const { application, form, forms, formsCount, inspection } = require('./forms')
const { holiday, holidays } = require('./holidays')
const {
  amortization,
  collectInstallmentAsNonLoanOfficer,
  disburseLoan,
  exportLoanReport,
  loan,
  loanId,
  loans,
  loansToDisburse,
  loansCount,
  updateLoan,
  withdrawSecurity,
} = require('./loans')
const { loanProductId, loanProducts } = require('./loanProducts')
const { notifications } = require('./notifications')
const { DateTime, Decimal, ObjectId } = require('./scalars')
const { settings } = require('./settings')
const {
  branchManagerId,
  loanOfficerId,
  user,
  changePassword,
  users,
  userId,
} = require('./users')
const { createUploadUrl } = require('./uploadUrl')
const {
  clientSummary,
  clientGroupSummary,
  loanOfficerSummary,
  branchOverview,
  bmCollectionsOverview,
} = require('./collectionsOverview')

const resolvers = {
  // Scalars
  DateTime,
  Decimal,
  ObjectId,
  // Related fields
  Client: {
    clientGroupId,
  },
  ClientGroup: {
    branchId,
    cashierId,
    loanOfficerId,
    presidentId,
    secretaryId,
  },
  ClientGroupsMeeting: {
    clientGroupId,
  },
  Form: {
    clientId,
    feedbackId,
    loanId,
    userId,
  },
  Loan: {
    branchId,
    branchManagerId,
    clientGroupId,
    clientId,
    feedbackId,
    loanOfficerId,
    loanProductId,
  },
  LoanForm: {
    application,
    inspection,
  },
  // Query
  Query: {
    amortization,
    branch,
    branches,
    canCloseCashAtHandReport,
    cashAtHandForm,
    client,
    clientGroup,
    clientGroupWithStats,
    clientGroups,
    clientGroupsCount,
    clientGroupsMeeting,
    clientGroupsMeetings,
    clients,
    clientsCount,
    clientsInspections,
    // TODONOT: clientsToSurvey (unused)
    // TODONOT: clientsWithoutForm (unused)
    // TODONOT: clientsWithoutForms (unused)
    // TODONOT: customClients (unused)
    // TODONOT: event (unused)
    // TODONOT: events (unused)
    // TODONOT: feedback (unused)
    // TODONOT: feedbacks (unused)
    form,
    forms,
    formsCount,
    holiday,
    holidays,
    initCashAtHandReport,
    loan,
    // TODONOT: loanProduct (unused)
    loanProducts,
    loans,
    loansToDisburse,
    // TODONOT: loansByClientGroupId (unused)
    loansCount,
    // TODONOT: loansToDisburseByBranchManagerId (unused)
    notifications,
    // TODONOT: setting (unused)
    settings,
    todayClientGroups,
    todayMeeting,
    todayRealizations,
    user,
    users,
    clientSummary,
    clientGroupSummary,
    loanOfficerSummary,
    branchOverview,
    bmCollectionsOverview,
  },
  Mutation: {
    addEvent,
    collectInstallment,
    collectInstallmentAsNonLoanOfficer,
    createUploadUrl,
    disburseLoan,
    exportCashAtHandReport,
    exportLoanReport,
    moveClientToAnotherClientGroup,
    openCashAtHandReport,
    updateLoan,
    withdrawSecurity,
    changePassword,
  },
}

module.exports = resolvers
