const { gql } = require('apollo-server-fastify')

const typeDefs = gql`
  enum BranchSortByInput {
    _ID_ASC
    CODE_DESC
    CREATEDAT_DESC
    INITOPENINGBALANCE_ASC
    UPDATEDAT_ASC
    _ID_DESC
    CODE_ASC
    INITDATE_DESC
    STATUS_ASC
    CREATEDAT_ASC
    INITDATE_ASC
    INITOPENINGBALANCE_DESC
    NAME_ASC
    NAME_DESC
    STATUS_DESC
    UPDATEDAT_DESC
  }

  enum ClientGroupSortByInput {
    CASHIERID_DESC
    CODE_DESC
    LOANSOUTSTANDING_DESC
    NAME_ASC
    NAME_DESC
    SAVINGSBALANCE_DESC
    BRANCHID_ASC
    CASHIERID_ASC
    STATUS_ASC
    LOANOFFICERID_ASC
    PRESIDENTID_DESC
    SAVINGSBALANCE_ASC
    SECRETARYID_ASC
    SECRETARYID_DESC
    _ID_ASC
    _ID_DESC
    CREATEDAT_DESC
    LOANSOUTSTANDING_ASC
    STATUS_DESC
    UPDATEDAT_DESC
    BRANCHID_DESC
    CODE_ASC
    PRESIDENTID_ASC
    UPDATEDAT_ASC
    CREATEDAT_ASC
    LOANOFFICERID_DESC
  }

  enum ClientGroupsMeetingSortByInput {
    STARTEDAT_DESC
    _ID_ASC
    CREATEDAT_DESC
    ENDEDAT_DESC
    PHOTOURL_DESC
    REQUESTS_ASC
    REQUESTS_DESC
    SCHEDULEDAT_ASC
    UPDATEDAT_ASC
    _ID_DESC
    CLIENTGROUPID_ASC
    NOTES_ASC
    NOTES_DESC
    PHOTOURL_ASC
    PLACE_ASC
    CLIENTGROUPID_DESC
    ENDEDAT_ASC
    PHOTO_DESC
    PLACE_DESC
    SCHEDULEDAT_DESC
    STARTEDAT_ASC
    CREATEDAT_ASC
    PHOTO_ASC
    UPDATEDAT_DESC
  }

  enum ClientSortByInput {
    STATUS_DESC
    ADDEDAT_DESC
    ADMISSIONAT_DESC
    CODE_DESC
    FIRSTNAME_DESC
    PHOTO_DESC
    _ID_ASC
    LASTEVENTID_ASC
    LASTNAME_ASC
    LASTRENEWALAT_ASC
    ROLE_ASC
    LASTRENEWALAT_DESC
    _ID_DESC
    CLIENTGROUPID_ASC
    CODE_ASC
    CLIENTGROUPID_DESC
    LASTNAME_DESC
    STATUS_ASC
    ADDEDAT_ASC
    ADMISSIONAT_ASC
    CREATEDAT_ASC
    PHOTO_ASC
    UPDATEDAT_ASC
    UPDATEDAT_DESC
    CREATEDAT_DESC
    FIRSTNAME_ASC
    LASTEVENTID_DESC
    ROLE_DESC
  }

  enum FormSortByInput {
    CODE_DESC
    FEEDBACKID_DESC
    STATUS_DESC
    UPDATEDAT_ASC
    UPDATEDAT_DESC
    CREATEDAT_ASC
    FEEDBACKID_ASC
    LASTEVENTID_ASC
    USERID_ASC
    _ID_ASC
    _ID_DESC
    CLIENTID_DESC
    CODE_ASC
    CREATEDAT_DESC
    LOANID_DESC
    RELATEDFORMID_ASC
    TYPE_ASC
    TYPE_DESC
    USERID_DESC
    CLIENTID_ASC
    LASTEVENTID_DESC
    LOANID_ASC
    NOTES_ASC
    NOTES_DESC
    RELATEDFORMID_DESC
    STATUS_ASC
  }

  enum HolidaySortByInput {
    CREATEDAT_ASC
    STARTAT_ASC
    UPDATEDAT_DESC
    STARTAT_DESC
    _ID_ASC
    NAME_ASC
    NAME_DESC
    NOTES_DESC
    ENDAT_ASC
    UPDATEDAT_ASC
    _ID_DESC
    CREATEDAT_DESC
    ENDAT_DESC
    NOTES_ASC
  }

  enum LoanProductSortByInput {
    RISKCOVER_DESC
    STATUS_ASC
    UPDATEDAT_DESC
    _ID_ASC
    CREATEDAT_DESC
    DISBURSEMENT_DESC
    GRACEPERIOD_DESC
    UPDATEDAT_ASC
    STATUS_DESC
    _ID_DESC
    FIRSTLOANDISBURSEMENT_ASC
    FIRSTLOANDISBURSEMENT_DESC
    LOANINSURANCE_DESC
    NAME_DESC
    RISKCOVER_ASC
    CREATEDAT_ASC
    DISBURSEMENT_ASC
    GRACEPERIOD_ASC
    LOANINSURANCE_ASC
    NAME_ASC
  }

  enum LoanSortByInput {
    APPROVEDAMOUNT_ASC
    BRANCHID_ASC
    CLIENTGROUPNAME_ASC
    DURATION_DESC
    CASHCOLLATERAL_DESC
    CYCLE_DESC
    DISBURSEMENTAT_DESC
    FEEDBACKID_DESC
    BRANCHMANAGERNAME_ASC
    CASHCOLLATERAL_ASC
    CREATEDAT_ASC
    INTERESTRATE_DESC
    BRANCHNAME_DESC
    CLIENTID_ASC
    UPDATEDAT_ASC
    CLIENTGROUPID_ASC
    INTERESTRATE_ASC
    APPLICATIONAT_DESC
    BRANCHID_DESC
    LOANINSURANCE_ASC
    REQUESTEDAMOUNT_DESC
    APPROVEDAMOUNT_DESC
    CLIENTID_DESC
    CYCLE_ASC
    BRANCHMANAGERID_ASC
    BRANCHMANAGERNAME_DESC
    CODE_DESC
    CREATEDAT_DESC
    LOANOFFICERNAME_ASC
    LOANOFFICERNAME_DESC
    LOANPRODUCTID_DESC
    STATUS_DESC
    UPDATEDAT_DESC
    BRANCHMANAGERID_DESC
    BRANCHNAME_ASC
    REQUESTEDAMOUNT_ASC
    _ID_ASC
    APPLICATIONAT_ASC
    CLIENTGROUPNAME_DESC
    DISBURSEMENTAT_ASC
    LOANPRODUCTNAME_ASC
    MANAGERDECISIONAT_DESC
    CLIENTGROUPID_DESC
    FEEDBACKID_ASC
    LOANOFFICERID_DESC
    STATUS_ASC
    _ID_DESC
    LOANINSURANCE_DESC
    LOANPRODUCTNAME_DESC
    DURATION_ASC
    LOANOFFICERID_ASC
    LOANPRODUCTID_ASC
    MANAGERDECISIONAT_ASC
    CODE_ASC
  }

  enum SettingSortByInput {
    _ID_ASC
    NAME_ASC
    UPDATEDAT_DESC
    VALUE_ASC
    VALUE_DESC
    _ID_DESC
    CREATEDAT_ASC
    CREATEDAT_DESC
    NAME_DESC
    UPDATEDAT_ASC
  }

  input BranchAddressQueryInput {
    county_in: [String]
    street_ne: String
    OR: [BranchAddressQueryInput!]
    subcounty_gte: String
    AND: [BranchAddressQueryInput!]
    subcounty_nin: [String]
    area_exists: Boolean
    subcounty_lte: String
    street: String
    street_gt: String
    area_ne: String
    district_lte: String
    subcounty_gt: String
    street_lte: String
    area_gt: String
    county_gt: String
    county_gte: String
    county_lt: String
    district_nin: [String]
    area_nin: [String]
    district_lt: String
    district_gt: String
    district_gte: String
    street_gte: String
    subcounty_ne: String
    street_in: [String]
    subcounty_in: [String]
    area: String
    area_in: [String]
    county_nin: [String]
    county: String
    county_lte: String
    district_ne: String
    district: String
    street_exists: Boolean
    street_nin: [String]
    county_ne: String
    subcounty_lt: String
    subcounty: String
    area_lt: String
    area_gte: String
    district_in: [String]
    district_exists: Boolean
    area_lte: String
    subcounty_exists: Boolean
    street_lt: String
    county_exists: Boolean
  }

  input BranchOtherQueryInput {
    majorCompetitors_nin: [String]
    majorCompetitors: String
    outreach_gt: String
    outreach_nin: [String]
    servicingBanks_gt: String
    AND: [BranchOtherQueryInput!]
    outreach: String
    majorCompetitors_lte: String
    servicingBanks_lte: String
    majorCompetitors_gt: String
    servicingBanks_ne: String
    majorCompetitors_lt: String
    servicingBanks_lt: String
    servicingBanks: String
    outreach_lt: String
    servicingBanks_nin: [String]
    servicingBanks_gte: String
    outreach_exists: Boolean
    servicingBanks_in: [String]
    OR: [BranchOtherQueryInput!]
    outreach_in: [String]
    majorCompetitors_ne: String
    servicingBanks_exists: Boolean
    outreach_gte: String
    majorCompetitors_in: [String]
    outreach_lte: String
    outreach_ne: String
    majorCompetitors_exists: Boolean
    majorCompetitors_gte: String
  }

  input BranchQueryInput {
    code_gt: String
    code_lte: String
    status: String
    code_gte: String
    code: String
    initDate_gt: DateTime
    initDate_in: [DateTime]
    updatedAt_gt: DateTime
    updatedAt_in: [DateTime]
    updatedAt_lte: DateTime
    code_nin: [String]
    _id_nin: [ObjectId]
    address: BranchAddressQueryInput
    createdAt_in: [DateTime]
    initDate_nin: [DateTime]
    address_exists: Boolean
    initDate_lte: DateTime
    initOpeningBalance_gt: Int
    AND: [BranchQueryInput!]
    _id_ne: ObjectId
    status_lt: String
    others: BranchOtherQueryInput
    updatedAt_ne: DateTime
    _id_lte: ObjectId
    name_exists: Boolean
    createdAt_gte: DateTime
    createdAt_ne: DateTime
    status_gte: String
    name_gt: String
    name_in: [String]
    updatedAt_lt: DateTime
    initOpeningBalance: Int
    createdAt_exists: Boolean
    others_exists: Boolean
    name_ne: String
    initDate_ne: DateTime
    code_lt: String
    initDate: DateTime
    name: String
    name_gte: String
    initDate_gte: DateTime
    _id: ObjectId
    _id_lt: ObjectId
    name_nin: [String]
    updatedAt_gte: DateTime
    updatedAt_nin: [DateTime]
    _id_gte: ObjectId
    code_ne: String
    status_gt: String
    createdAt_nin: [DateTime]
    createdAt_gt: DateTime
    initDate_lt: DateTime
    _id_gt: ObjectId
    _id_exists: Boolean
    code_exists: Boolean
    status_lte: String
    status_nin: [String]
    status_ne: String
    initOpeningBalance_lte: Int
    name_lte: String
    initOpeningBalance_in: [Int]
    createdAt: DateTime
    status_in: [String]
    OR: [BranchQueryInput!]
    updatedAt_exists: Boolean
    updatedAt: DateTime
    code_in: [String]
    status_exists: Boolean
    initOpeningBalance_nin: [Int]
    name_lt: String
    initDate_exists: Boolean
    initOpeningBalance_exists: Boolean
    initOpeningBalance_lt: Int
    createdAt_lte: DateTime
    createdAt_lt: DateTime
    initOpeningBalance_gte: Int
    initOpeningBalance_ne: Int
    _id_in: [ObjectId]
  }

  input CanCloseCashAtHandReportInput {
    branchId: String
    date: String
  }

  input CashAtHandFormPaymentExpenseQueryInput {
    internetNotes_lt: String
    rubbishCollection_ne: Int
    staffAirtimeNotes_ne: String
    miscellaneousNotes_lte: String
    utilitiesNotes: String
    staffLunchNotes_lte: String
    internet_nin: [Int]
    rubbishCollectionNotes_ne: String
    rubbishCollectionNotes_lt: String
    officeManagementNotes_in: [String]
    rent_gte: Int
    internetNotes_gt: String
    staffTransport_lte: Int
    insuranceClaimNotes_exists: Boolean
    miscellaneousNotes_exists: Boolean
    staffLunch_lt: Int
    staffAirtime_gt: Int
    officeManagementNotes_gte: String
    utilitiesNotes_gte: String
    internet_lte: Int
    staffTransport_nin: [Int]
    utilitiesNotes_exists: Boolean
    staffTransport_lt: Int
    officeManagementNotes: String
    utilities_ne: Int
    staffTransportNotes_lt: String
    staffTransportNotes_in: [String]
    rubbishCollectionNotes_nin: [String]
    insuranceClaim: Int
    miscellaneousNotes_in: [String]
    insuranceClaimNotes_ne: String
    internetNotes_gte: String
    rentNotes_gt: String
    internetNotes_lte: String
    insuranceClaimNotes_lt: String
    rent_exists: Boolean
    staffTransport_gte: Int
    staffLunchNotes_exists: Boolean
    officeManagementNotes_ne: String
    internetNotes_in: [String]
    utilitiesNotes_lt: String
    officeManagementNotes_nin: [String]
    rentNotes_exists: Boolean
    rubbishCollection_gt: Int
    staffLunchNotes_nin: [String]
    utilitiesNotes_ne: String
    rentNotes: String
    insuranceClaimNotes_gte: String
    rent_nin: [Int]
    internet_gt: Int
    staffLunchNotes: String
    officeManagementNotes_gt: String
    officeManagementNotes_lte: String
    internet_lt: Int
    miscellaneous_gt: Int
    insuranceClaim_in: [Int]
    staffAirtimeNotes_gt: String
    officeManagement_gte: Int
    rubbishCollection_exists: Boolean
    rent_gt: Int
    rentNotes_lte: String
    staffAirtimeNotes_in: [String]
    rent_ne: Int
    staffAirtime_gte: Int
    utilitiesNotes_lte: String
    OR: [CashAtHandFormPaymentExpenseQueryInput!]
    staffTransportNotes_ne: String
    utilities_lte: Int
    miscellaneousNotes_gt: String
    staffAirtime_lte: Int
    staffLunch_exists: Boolean
    miscellaneousNotes_gte: String
    staffAirtime_nin: [Int]
    insuranceClaimNotes_gt: String
    miscellaneous_exists: Boolean
    rentNotes_lt: String
    staffLunch_in: [Int]
    insuranceClaim_nin: [Int]
    staffTransportNotes_gte: String
    rubbishCollectionNotes_lte: String
    miscellaneousNotes: String
    officeManagement: Int
    rentNotes_in: [String]
    utilities_lt: Int
    insuranceClaim_lte: Int
    staffTransport_gt: Int
    staffTransportNotes_gt: String
    rentNotes_nin: [String]
    insuranceClaim_exists: Boolean
    rubbishCollection: Int
    staffAirtime: Int
    staffAirtimeNotes_exists: Boolean
    staffAirtimeNotes_lte: String
    staffAirtime_ne: Int
    miscellaneousNotes_nin: [String]
    insuranceClaimNotes_nin: [String]
    insuranceClaim_gte: Int
    staffTransportNotes: String
    internetNotes_exists: Boolean
    utilities_gte: Int
    miscellaneous_nin: [Int]
    staffTransport_ne: Int
    officeManagementNotes_lt: String
    insuranceClaim_lt: Int
    utilities_in: [Int]
    officeManagement_nin: [Int]
    internet_in: [Int]
    utilitiesNotes_nin: [String]
    miscellaneous_gte: Int
    staffAirtime_in: [Int]
    staffLunchNotes_gt: String
    rentNotes_ne: String
    internet: Int
    miscellaneousNotes_lt: String
    rubbishCollection_in: [Int]
    rubbishCollectionNotes_gt: String
    officeManagementNotes_exists: Boolean
    rubbishCollectionNotes: String
    rentNotes_gte: String
    rent_lt: Int
    staffLunchNotes_ne: String
    insuranceClaimNotes_in: [String]
    rubbishCollection_lte: Int
    officeManagement_lt: Int
    internet_exists: Boolean
    miscellaneous_lte: Int
    staffTransportNotes_exists: Boolean
    insuranceClaimNotes: String
    officeManagement_in: [Int]
    staffTransport_in: [Int]
    utilities_exists: Boolean
    insuranceClaim_gt: Int
    staffAirtimeNotes_gte: String
    utilities_nin: [Int]
    rent_lte: Int
    internetNotes_ne: String
    officeManagement_lte: Int
    staffLunchNotes_in: [String]
    utilities_gt: Int
    rubbishCollectionNotes_gte: String
    staffAirtimeNotes: String
    staffLunch_ne: Int
    miscellaneousNotes_ne: String
    rubbishCollection_nin: [Int]
    rubbishCollectionNotes_in: [String]
    rubbishCollection_gte: Int
    rubbishCollectionNotes_exists: Boolean
    miscellaneous_ne: Int
    staffLunch: Int
    utilities: Int
    staffTransportNotes_nin: [String]
    officeManagement_gt: Int
    utilitiesNotes_in: [String]
    rubbishCollection_lt: Int
    officeManagement_exists: Boolean
    internetNotes_nin: [String]
    staffAirtime_exists: Boolean
    staffAirtimeNotes_nin: [String]
    staffTransport_exists: Boolean
    staffLunch_lte: Int
    rent: Int
    rent_in: [Int]
    AND: [CashAtHandFormPaymentExpenseQueryInput!]
    utilitiesNotes_gt: String
    miscellaneous_lt: Int
    internetNotes: String
    staffTransportNotes_lte: String
    insuranceClaim_ne: Int
    staffLunch_gt: Int
    staffLunch_nin: [Int]
    internet_ne: Int
    staffLunchNotes_lt: String
    staffTransport: Int
    internet_gte: Int
    insuranceClaimNotes_lte: String
    staffAirtimeNotes_lt: String
    staffLunchNotes_gte: String
    miscellaneous: Int
    staffAirtime_lt: Int
    staffLunch_gte: Int
    officeManagement_ne: Int
    miscellaneous_in: [Int]
  }

  input CashAtHandFormPaymentQueryInput {
    securityReturn_gt: Int
    toHeadOffice_in: [Int]
    toHeadOfficeNotes_ne: String
    toHeadOffice_ne: Int
    securityReturnNotes_in: [String]
    toHeadOfficeNotes_gt: String
    loanDisbursements_lte: Int
    loanDisbursements_gt: Int
    bankDepositNotes_gt: String
    expenses_exists: Boolean
    bankDeposit_gte: Int
    loanDisbursements_gte: Int
    toHeadOfficeNotes_lte: String
    bankDeposit_lte: Int
    toOtherBranchesNotes_exists: Boolean
    toHeadOffice_gte: Int
    bankDepositNotes_lte: String
    OR: [CashAtHandFormPaymentQueryInput!]
    securityReturn_nin: [Int]
    bankDepositNotes_exists: Boolean
    toOtherBranchesNotes_nin: [String]
    toHeadOffice: Int
    bankDeposit_ne: Int
    loanDisbursements_nin: [Int]
    toOtherBranches: Int
    bankDeposit_gt: Int
    securityReturnNotes_nin: [String]
    bankDeposit_in: [Int]
    loanDisbursements_lt: Int
    securityReturnNotes_ne: String
    bankDepositNotes_gte: String
    toOtherBranches_lte: Int
    toHeadOffice_gt: Int
    securityReturn: Int
    toOtherBranchesNotes_ne: String
    securityReturn_in: [Int]
    toOtherBranchesNotes: String
    securityReturnNotes_gte: String
    toHeadOffice_nin: [Int]
    toHeadOfficeNotes_gte: String
    toHeadOfficeNotes: String
    toOtherBranchesNotes_gt: String
    AND: [CashAtHandFormPaymentQueryInput!]
    loanDisbursements: Int
    toOtherBranches_exists: Boolean
    securityReturn_exists: Boolean
    bankDeposit_nin: [Int]
    toOtherBranches_gte: Int
    toHeadOffice_exists: Boolean
    toOtherBranchesNotes_lte: String
    securityReturnNotes_lt: String
    toHeadOfficeNotes_nin: [String]
    loanDisbursements_in: [Int]
    securityReturn_ne: Int
    toOtherBranchesNotes_in: [String]
    securityReturnNotes: String
    securityReturn_lt: Int
    securityReturnNotes_gt: String
    toOtherBranches_lt: Int
    toOtherBranchesNotes_lt: String
    toHeadOfficeNotes_lt: String
    bankDepositNotes_ne: String
    expenses: CashAtHandFormPaymentExpenseQueryInput
    bankDeposit: Int
    bankDepositNotes_lt: String
    securityReturnNotes_lte: String
    bankDeposit_lt: Int
    bankDepositNotes_nin: [String]
    toOtherBranches_in: [Int]
    toHeadOffice_lt: Int
    toOtherBranches_gt: Int
    loanDisbursements_exists: Boolean
    securityReturnNotes_exists: Boolean
    toHeadOfficeNotes_exists: Boolean
    securityReturn_gte: Int
    toOtherBranches_nin: [Int]
    toOtherBranches_ne: Int
    bankDepositNotes_in: [String]
    toOtherBranchesNotes_gte: String
    toHeadOfficeNotes_in: [String]
    loanDisbursements_ne: Int
    securityReturn_lte: Int
    toHeadOffice_lte: Int
    bankDeposit_exists: Boolean
    bankDepositNotes: String
  }

  input CashAtHandFormQueryInput {
    closingBalance_gte: Int
    _id_in: [ObjectId]
    updatedAt_lt: DateTime
    dateIso_ne: DateTime
    branchId_exists: Boolean
    closed_exists: Boolean
    dateIso_in: [DateTime]
    createdAt_exists: Boolean
    closingBalance_lt: Int
    closed_ne: Boolean
    _id_gt: ObjectId
    createdAt_gte: DateTime
    dateIso_lte: DateTime
    _id_lt: ObjectId
    _id_ne: ObjectId
    closingBalance_in: [Int]
    date_nin: [String]
    openingBalance_lte: Int
    openingBalance_ne: Int
    branchId: ObjectId
    openingBalance_in: [Int]
    openingBalance: Int
    OR: [CashAtHandFormQueryInput!]
    closingBalance_nin: [Int]
    dateIso_lt: DateTime
    updatedAt_gte: DateTime
    createdAt_gt: DateTime
    closingBalance: Int
    updatedAt_nin: [DateTime]
    openingBalance_exists: Boolean
    closingBalance_exists: Boolean
    createdAt_lt: DateTime
    _id: ObjectId
    updatedAt: DateTime
    _id_lte: ObjectId
    openingBalance_gte: Int
    date_lt: String
    updatedAt_in: [DateTime]
    branchId_gte: ObjectId
    payments_exists: Boolean
    date: String
    _id_exists: Boolean
    branchId_lt: ObjectId
    closingBalance_ne: Int
    date_in: [String]
    branchId_nin: [ObjectId]
    updatedAt_lte: DateTime
    date_gte: String
    branchId_lte: ObjectId
    updatedAt_exists: Boolean
    date_ne: String
    payments: CashAtHandFormPaymentQueryInput
    AND: [CashAtHandFormQueryInput!]
    createdAt_in: [DateTime]
    updatedAt_gt: DateTime
    dateIso_gte: DateTime
    date_exists: Boolean
    createdAt_ne: DateTime
    closed: Boolean
    createdAt_lte: DateTime
    _id_nin: [ObjectId]
    closingBalance_gt: Int
    date_lte: String
    branchId_gt: ObjectId
    date_gt: String
    openingBalance_gt: Int
    closingBalance_lte: Int
    dateIso: DateTime
    openingBalance_lt: Int
    branchId_ne: ObjectId
    createdAt: DateTime
    createdAt_nin: [DateTime]
    receipts_exists: Boolean
    branchId_in: [ObjectId]
    _id_gte: ObjectId
    updatedAt_ne: DateTime
    dateIso_exists: Boolean
    dateIso_gt: DateTime
    openingBalance_nin: [Int]
    receipts: CashAtHandFormReceiptQueryInput
    dateIso_nin: [DateTime]
  }

  input CashAtHandFormReceiptQueryInput {
    fromOtherBranches_ne: Int
    fromOtherBranches_exists: Boolean
    bankWithdrawal_lte: Int
    otherIncomeNotes_lt: String
    fromHeadOffice: Int
    bankWithdrawal_lt: Int
    fromHeadOfficeNotes_gt: String
    fromHeadOfficeNotes: String
    bankWithdrawal: Int
    fromHeadOfficeNotes_lte: String
    fromOtherBranchesNotes_exists: Boolean
    fromOtherBranchesNotes_lt: String
    fromHeadOfficeNotes_exists: Boolean
    AND: [CashAtHandFormReceiptQueryInput!]
    loanRelatedFundsReceived_gte: Int
    otherIncome_in: [Int]
    otherIncomeNotes_lte: String
    bankWithdrawalNotes_exists: Boolean
    bankWithdrawal_gte: Int
    loanRelatedFundsReceived_exists: Boolean
    fromHeadOffice_in: [Int]
    fromOtherBranches_lte: Int
    bankWithdrawal_nin: [Int]
    OR: [CashAtHandFormReceiptQueryInput!]
    fromHeadOffice_lt: Int
    bankWithdrawal_in: [Int]
    fromOtherBranches_gt: Int
    fromHeadOffice_exists: Boolean
    fromHeadOffice_nin: [Int]
    otherIncome_lte: Int
    bankWithdrawalNotes_in: [String]
    bankWithdrawal_exists: Boolean
    fromOtherBranches: Int
    otherIncome: Int
    fromHeadOfficeNotes_nin: [String]
    loanRelatedFundsReceived_lte: Int
    otherIncomeNotes_gte: String
    fromHeadOfficeNotes_in: [String]
    fromHeadOffice_gt: Int
    bankWithdrawalNotes_lte: String
    fromOtherBranchesNotes_ne: String
    loanRelatedFundsReceived_lt: Int
    fromOtherBranches_nin: [Int]
    fromOtherBranchesNotes_lte: String
    otherIncomeNotes: String
    bankWithdrawalNotes_lt: String
    otherIncomeNotes_ne: String
    fromOtherBranchesNotes_gt: String
    loanRelatedFundsReceived: Int
    bankWithdrawal_gt: Int
    otherIncomeNotes_nin: [String]
    fromOtherBranches_lt: Int
    otherIncomeNotes_in: [String]
    otherIncome_nin: [Int]
    fromHeadOfficeNotes_ne: String
    fromOtherBranchesNotes: String
    bankWithdrawalNotes_nin: [String]
    fromOtherBranchesNotes_in: [String]
    bankWithdrawalNotes: String
    loanRelatedFundsReceived_in: [Int]
    loanRelatedFundsReceived_ne: Int
    loanRelatedFundsReceived_nin: [Int]
    bankWithdrawalNotes_gt: String
    fromHeadOfficeNotes_lt: String
    otherIncomeNotes_gt: String
    loanRelatedFundsReceived_gt: Int
    fromOtherBranches_in: [Int]
    fromHeadOffice_lte: Int
    bankWithdrawalNotes_ne: String
    otherIncome_exists: Boolean
    bankWithdrawalNotes_gte: String
    otherIncome_ne: Int
    otherIncome_lt: Int
    fromOtherBranches_gte: Int
    otherIncomeNotes_exists: Boolean
    fromOtherBranchesNotes_gte: String
    fromHeadOffice_ne: Int
    fromHeadOfficeNotes_gte: String
    otherIncome_gt: Int
    fromOtherBranchesNotes_nin: [String]
    bankWithdrawal_ne: Int
    otherIncome_gte: Int
    fromHeadOffice_gte: Int
  }

  input CashAtHandReportInputType {
    branchId: String
    date: String
  }

  input ClientAdmissionQueryInput {
    notes_in: [String]
    address_lte: String
    notes_lte: String
    address_nin: [String]
    notes: String
    notes_nin: [String]
    address_gte: String
    notes_gte: String
    address_exists: Boolean
    notes_lt: String
    OR: [ClientAdmissionQueryInput!]
    address_ne: String
    address_lt: String
    address_gt: String
    address: String
    address_in: [String]
    notes_ne: String
    notes_gt: String
    AND: [ClientAdmissionQueryInput!]
    notes_exists: Boolean
  }

  input ClientGroupsMeetingAttendanceQueryInput {
    clientId_gt: ObjectId
    firstName_in: [String]
    firstName_gt: String
    attended_ne: Boolean
    lastName_lte: String
    representative_ne: Boolean
    lastName_lt: String
    lastName_ne: String
    clientId_nin: [ObjectId]
    lastName_gt: String
    lastName: String
    firstName_ne: String
    clientId_gte: ObjectId
    clientId_in: [ObjectId]
    lastName_exists: Boolean
    firstName: String
    clientId_exists: Boolean
    attended: Boolean
    firstName_lt: String
    AND: [ClientGroupsMeetingAttendanceQueryInput!]
    firstName_gte: String
    lastName_nin: [String]
    clientId: ObjectId
    clientId_lte: ObjectId
    firstName_exists: Boolean
    representative_exists: Boolean
    clientId_ne: ObjectId
    lastName_gte: String
    OR: [ClientGroupsMeetingAttendanceQueryInput!]
    lastName_in: [String]
    attended_exists: Boolean
    clientId_lt: ObjectId
    representative: Boolean
    firstName_lte: String
    firstName_nin: [String]
  }

  input ClientGroupsMeetingInstallmentQueryInput {
    loanId_lte: ObjectId
    _id_lt: ObjectId
    clientId_gt: ObjectId
    due_in: [DateTime]
    installment_in: [Int]
    total: Int
    target_gte: Int
    clientId_ne: ObjectId
    target_lte: Int
    clientName_exists: Boolean
    due_gte: DateTime
    target_exists: Boolean
    clientName_gte: String
    due_lt: DateTime
    due_gt: DateTime
    cumulativeRealization_gt: Int
    AND: [ClientGroupsMeetingInstallmentQueryInput!]
    installment_gt: Int
    loanId_lt: ObjectId
    overdueInstallments_nin: [Int]
    overdueInstallments_gt: Int
    realization_exists: Boolean
    clientId_lte: ObjectId
    todaysRealization_nin: [Int]
    status_lt: String
    todaysRealization_lte: Int
    installment_lt: Int
    status_gte: String
    cumulativeRealization_in: [Int]
    loanId_exists: Boolean
    todaysRealization_ne: Int
    loanId_nin: [ObjectId]
    _id_exists: Boolean
    overdue_gte: Int
    approvedAmount_lt: Int
    overdue_lte: Int
    due_lte: DateTime
    installment_exists: Boolean
    cumulativeRealization_ne: Int
    overdueInstallments_lt: Int
    total_lt: Int
    approvedAmount_ne: Int
    clientName_lte: String
    target_gt: Int
    status: String
    approvedAmount_in: [Int]
    _id: ObjectId
    clientId_nin: [ObjectId]
    _id_lte: ObjectId
    approvedAmount_gt: Int
    total_in: [Int]
    target: Int
    installment_lte: Int
    openingBalance: Int
    cumulativeRealization_exists: Boolean
    _id_in: [ObjectId]
    OR: [ClientGroupsMeetingInstallmentQueryInput!]
    clientId_gte: ObjectId
    openingBalance_gt: Int
    clientId_in: [ObjectId]
    total_lte: Int
    overdueInstallments: Int
    clientId_lt: ObjectId
    clientName_ne: String
    realization_lte: Int
    overdue_in: [Int]
    loanId: ObjectId
    clientName_in: [String]
    openingBalance_in: [Int]
    openingBalance_lt: Int
    installment_gte: Int
    overdue_ne: Int
    status_lte: String
    overdue_lt: Int
    approvedAmount_nin: [Int]
    status_nin: [String]
    clientName: String
    realization_gt: Int
    realization_in: [Int]
    _id_gt: ObjectId
    overdueInstallments_ne: Int
    overdueInstallments_in: [Int]
    clientName_gt: String
    approvedAmount_lte: Int
    loanId_gte: ObjectId
    clientId: ObjectId
    loanId_ne: ObjectId
    target_nin: [Int]
    installment_nin: [Int]
    installment: Int
    overdueInstallments_exists: Boolean
    overdue_nin: [Int]
    approvedAmount_gte: Int
    target_ne: Int
    openingBalance_nin: [Int]
    target_in: [Int]
    overdue_exists: Boolean
    cumulativeRealization: Int
    loanId_in: [ObjectId]
    total_exists: Boolean
    target_lt: Int
    total_ne: Int
    total_nin: [Int]
    todaysRealization: Int
    todaysRealization_gte: Int
    loanId_gt: ObjectId
    due: DateTime
    overdueInstallments_lte: Int
    cumulativeRealization_lte: Int
    _id_gte: ObjectId
    approvedAmount_exists: Boolean
    installment_ne: Int
    _id_ne: ObjectId
    openingBalance_gte: Int
    overdue: Int
    clientId_exists: Boolean
    todaysRealization_lt: Int
    realization_ne: Int
    due_ne: DateTime
    openingBalance_exists: Boolean
    todaysRealization_in: [Int]
    cumulativeRealization_lt: Int
    total_gte: Int
    realization_lt: Int
    cumulativeRealization_gte: Int
    openingBalance_lte: Int
    realization: Int
    total_gt: Int
    clientName_lt: String
    todaysRealization_exists: Boolean
    todaysRealization_gt: Int
    overdueInstallments_gte: Int
    due_nin: [DateTime]
    openingBalance_ne: Int
    status_exists: Boolean
    clientName_nin: [String]
    overdue_gt: Int
    status_ne: String
    cumulativeRealization_nin: [Int]
    realization_nin: [Int]
    due_exists: Boolean
    realization_gte: Int
    status_in: [String]
    _id_nin: [ObjectId]
    approvedAmount: Int
    status_gt: String
  }

  input ClientGroupsMeetingLoanOfficerQueryInput {
    firstName_lte: String
    lastName_lte: String
    lastName_in: [String]
    lastName_gte: String
    lastName: String
    AND: [ClientGroupsMeetingLoanOfficerQueryInput!]
    lastName_exists: Boolean
    firstName_gt: String
    lastName_ne: String
    firstName_lt: String
    firstName_exists: Boolean
    lastName_gt: String
    OR: [ClientGroupsMeetingLoanOfficerQueryInput!]
    lastName_lt: String
    firstName_ne: String
    firstName_in: [String]
    firstName_nin: [String]
    firstName_gte: String
    lastName_nin: [String]
    firstName: String
  }

  input ClientGroupsMeetingQueryInput {
    startedAt_ne: DateTime
    updatedAt_lt: DateTime
    AND: [ClientGroupsMeetingQueryInput!]
    requests_exists: Boolean
    requests_gt: String
    OR: [ClientGroupsMeetingQueryInput!]
    startedAt_nin: [DateTime]
    place_lt: String
    createdAt_ne: DateTime
    place_ne: String
    photoUrl_lt: String
    photoUrl_gte: String
    _id_gte: ObjectId
    notes_nin: [String]
    requests_lt: String
    photo_nin: [String]
    photo_lt: String
    loanOfficer_exists: Boolean
    requests: String
    photoUrl_lte: String
    photoUrl_ne: String
    photoUrl: String
    createdAt_gt: DateTime
    place_lte: String
    photo_gte: String
    photo_exists: Boolean
    place: String
    scheduledAt_exists: Boolean
    potentialClientsVerified_exists: Boolean
    notes_gte: String
    place_in: [String]
    place_gt: String
    endedAt: DateTime
    place_exists: Boolean
    _id_ne: ObjectId
    photo_in: [String]
    updatedAt_ne: DateTime
    updatedAt_lte: DateTime
    updatedAt_gt: DateTime
    createdAt_gte: DateTime
    updatedAt_nin: [DateTime]
    startedAt: DateTime
    updatedAt_exists: Boolean
    updatedAt: DateTime
    createdAt_in: [DateTime]
    photo_gt: String
    scheduledAt_ne: DateTime
    installments_exists: Boolean
    potentialClientsVerified: Boolean
    place_gte: String
    attendance_nin: [ClientGroupsMeetingAttendanceQueryInput]
    notes_exists: Boolean
    requests_lte: String
    potentialClientsVerified_ne: Boolean
    attendance: [ClientGroupsMeetingAttendanceQueryInput]
    endedAt_lt: DateTime
    photo_ne: String
    createdAt_nin: [DateTime]
    createdAt_exists: Boolean
    clientGroupId_exists: Boolean
    endedAt_nin: [DateTime]
    _id_lte: ObjectId
    photoUrl_exists: Boolean
    createdAt_lte: DateTime
    notes_in: [String]
    startedAt_gte: DateTime
    createdAt: DateTime
    _id_exists: Boolean
    scheduledAt_gte: DateTime
    _id_lt: ObjectId
    attendance_exists: Boolean
    scheduledAt_in: [DateTime]
    endedAt_ne: DateTime
    notes_lt: String
    startedAt_lt: DateTime
    endedAt_gte: DateTime
    _id_in: [ObjectId]
    requests_ne: String
    scheduledAt_lt: DateTime
    attendance_in: [ClientGroupsMeetingAttendanceQueryInput]
    loanOfficer: ClientGroupsMeetingLoanOfficerQueryInput
    notes_ne: String
    updatedAt_gte: DateTime
    photo: String
    requests_nin: [String]
    endedAt_gt: DateTime
    photoUrl_in: [String]
    endedAt_in: [DateTime]
    photoUrl_gt: String
    scheduledAt: DateTime
    updatedAt_in: [DateTime]
    place_nin: [String]
    startedAt_gt: DateTime
    endedAt_exists: Boolean
    _id_gt: ObjectId
    requests_gte: String
    scheduledAt_gt: DateTime
    installments: [ClientGroupsMeetingInstallmentQueryInput]
    scheduledAt_nin: [DateTime]
    notes: String
    startedAt_in: [DateTime]
    _id_nin: [ObjectId]
    startedAt_exists: Boolean
    photoUrl_nin: [String]
    notes_gt: String
    installments_in: [ClientGroupsMeetingInstallmentQueryInput]
    notes_lte: String
    startedAt_lte: DateTime
    requests_in: [String]
    createdAt_lt: DateTime
    installments_nin: [ClientGroupsMeetingInstallmentQueryInput]
    scheduledAt_lte: DateTime
    _id: ObjectId
    photo_lte: String
    endedAt_lte: DateTime
    clientGroupId: ClientGroupQueryInput
  }

  input ClientGroupMeetingQueryInput {
    frequency_exists: Boolean
    frequency_in: [String]
    lat_lte: String
    lat_nin: [String]
    frequency_gte: String
    lng_lt: String
    time_ne: String
    address: String
    lat_lt: String
    address_lt: String
    lng_nin: [String]
    lng: String
    address_exists: Boolean
    dayOfWeek_gt: Int
    address_gte: String
    lng_in: [String]
    lat_gte: String
    dayOfWeek_ne: Int
    startedAt_exists: Boolean
    startedAt: DateTime
    startedAt_lt: DateTime
    lng_exists: Boolean
    lng_ne: String
    AND: [ClientGroupMeetingQueryInput!]
    address_gt: String
    dayOfWeek_exists: Boolean
    frequency_lt: String
    frequency: String
    time_lte: String
    address_ne: String
    address_in: [String]
    dayOfWeek_gte: Int
    frequency_gt: String
    startedAt_gte: DateTime
    time_gte: String
    OR: [ClientGroupMeetingQueryInput!]
    time: String
    time_in: [String]
    lat: String
    address_lte: String
    dayOfWeek_lt: Int
    dayOfWeek_nin: [Int]
    dayOfWeek_in: [Int]
    dayOfWeek_lte: Int
    lat_ne: String
    address_nin: [String]
    dayOfWeek: Int
    startedAt_nin: [DateTime]
    frequency_ne: String
    time_nin: [String]
    startedAt_gt: DateTime
    time_lt: String
    lng_gte: String
    lng_lte: String
    startedAt_lte: DateTime
    time_gt: String
    lng_gt: String
    lat_exists: Boolean
    lat_in: [String]
    frequency_lte: String
    startedAt_in: [DateTime]
    startedAt_ne: DateTime
    time_exists: Boolean
    lat_gt: String
    frequency_nin: [String]
  }

  input ClientGroupQueryInput {
    updatedAt_lte: DateTime
    code_nin: [String]
    status_lt: String
    name_lt: String
    presidentId_exists: Boolean
    loanOfficerId: UserQueryInput
    status_nin: [String]
    cashierId_exists: Boolean
    _id_ne: ObjectId
    wasRejected_exists: Boolean
    code: String
    createdAt_lte: DateTime
    name_nin: [String]
    _id_exists: Boolean
    createdAt_ne: DateTime
    loansOutstanding_gt: Int
    createdAt_gt: DateTime
    loansOutstanding_ne: Int
    createdAt_exists: Boolean
    updatedAt_ne: DateTime
    cashierId: ClientQueryInput
    secretaryId_exists: Boolean
    loansOutstanding: Int
    savingsBalance_nin: [Int]
    status_exists: Boolean
    savingsBalance_lt: Int
    name_exists: Boolean
    createdAt_nin: [DateTime]
    _id_in: [ObjectId]
    name_gte: String
    updatedAt_nin: [DateTime]
    loansOutstanding_lte: Int
    savingsBalance: Int
    _id: ObjectId
    createdAt_in: [DateTime]
    _id_gt: ObjectId
    loanOfficerId_exists: Boolean
    loansOutstanding_lt: Int
    code_exists: Boolean
    meeting: ClientGroupMeetingQueryInput
    wasRejected_ne: Boolean
    loansOutstanding_gte: Int
    code_ne: String
    secretaryId: ClientQueryInput
    status_in: [String]
    updatedAt_gt: DateTime
    _id_lte: ObjectId
    _id_gte: ObjectId
    _id_lt: ObjectId
    name_gt: String
    OR: [ClientGroupQueryInput!]
    updatedAt: DateTime
    savingsBalance_ne: Int
    name_ne: String
    status_gte: String
    code_gt: String
    name_lte: String
    code_gte: String
    updatedAt_exists: Boolean
    createdAt_lt: DateTime
    meeting_exists: Boolean
    loansOutstanding_nin: [Int]
    branchId: BranchQueryInput
    status: String
    status_ne: String
    updatedAt_gte: DateTime
    updatedAt_in: [DateTime]
    loansOutstanding_in: [Int]
    status_gt: String
    code_lt: String
    name: String
    wasRejected: Boolean
    createdAt_gte: DateTime
    loansOutstanding_exists: Boolean
    savingsBalance_lte: Int
    status_lte: String
    presidentId: ClientQueryInput
    code_lte: String
    name_in: [String]
    savingsBalance_gte: Int
    _id_nin: [ObjectId]
    createdAt: DateTime
    branchId_exists: Boolean
    savingsBalance_in: [Int]
    updatedAt_lt: DateTime
    AND: [ClientGroupQueryInput!]
    savingsBalance_gt: Int
    savingsBalance_exists: Boolean
    code_in: [String]
  }

  input ClientQueryInput {
    status: String
    role_nin: [String]
    role: String
    photo_exists: Boolean
    addedAt_lte: DateTime
    role_lt: String
    firstName_gte: String
    lastName: String
    clientGroupId: ClientGroupQueryInput
    lastRenewalAt_in: [DateTime]
    photo: String
    photo_in: [String]
    role_in: [String]
    createdAt_lt: DateTime
    createdAt_gt: DateTime
    _id_ne: ObjectId
    firstName_nin: [String]
    status_lt: String
    passbook: Boolean
    updatedAt_lt: DateTime
    updatedAt_ne: DateTime
    firstName_in: [String]
    lastRenewalAt_gte: DateTime
    status_gte: String
    admissionAt_lte: DateTime
    addedAt_ne: DateTime
    photo_gt: String
    firstName: String
    createdAt: DateTime
    updatedAt: DateTime
    loans_in: [ObjectId]
    role_gt: String
    lastName_exists: Boolean
    photo_nin: [String]
    _id: ObjectId
    firstName_gt: String
    lastName_lte: String
    lastRenewalAt_ne: DateTime
    lastEventId_nin: [ObjectId]
    admissionAt: DateTime
    firstName_exists: Boolean
    loans: [ObjectId]
    createdAt_gte: DateTime
    code_gt: String
    loans_nin: [ObjectId]
    _id_exists: Boolean
    createdAt_lte: DateTime
    code_exists: Boolean
    admissionAt_gte: DateTime
    lastName_gte: String
    lastRenewalAt_lt: DateTime
    admission_exists: Boolean
    code_lte: String
    createdAt_in: [DateTime]
    admissionAt_in: [DateTime]
    admissionAt_gt: DateTime
    lastEventId_gt: ObjectId
    passbook_ne: Boolean
    updatedAt_in: [DateTime]
    lastRenewalAt: DateTime
    _id_nin: [ObjectId]
    status_exists: Boolean
    updatedAt_gte: DateTime
    firstName_lt: String
    status_nin: [String]
    admission: ClientAdmissionQueryInput
    lastRenewalAt_nin: [DateTime]
    status_lte: String
    admissionAt_exists: Boolean
    lastEventId: ObjectId
    photo_lte: String
    code_gte: String
    lastRenewalAt_exists: Boolean
    role_lte: String
    lastEventId_in: [ObjectId]
    createdAt_ne: DateTime
    photo_ne: String
    lastEventId_lte: ObjectId
    lastEventId_gte: ObjectId
    code_lt: String
    lastRenewalAt_gt: DateTime
    updatedAt_nin: [DateTime]
    addedAt_exists: Boolean
    _id_gt: ObjectId
    _id_in: [ObjectId]
    photo_lt: String
    clientGroupId_exists: Boolean
    photo_gte: String
    updatedAt_exists: Boolean
    admissionAt_lt: DateTime
    addedAt_gte: DateTime
    code_in: [String]
    role_ne: String
    code_ne: String
    lastEventId_lt: ObjectId
    lastName_nin: [String]
    AND: [ClientQueryInput!]
    OR: [ClientQueryInput!]
    passbook_exists: Boolean
    lastName_lt: String
    _id_lte: ObjectId
    admissionAt_ne: DateTime
    addedAt_gt: DateTime
    firstName_lte: String
    createdAt_exists: Boolean
    _id_lt: ObjectId
    _id_gte: ObjectId
    status_in: [String]
    status_ne: String
    firstName_ne: String
    updatedAt_gt: DateTime
    status_gt: String
    createdAt_nin: [DateTime]
    lastName_in: [String]
    lastEventId_exists: Boolean
    lastEventId_ne: ObjectId
    code_nin: [String]
    lastName_ne: String
    lastName_gt: String
    loans_exists: Boolean
    lastRenewalAt_lte: DateTime
    addedAt: DateTime
    admissionAt_nin: [DateTime]
    code: String
    role_exists: Boolean
    updatedAt_lte: DateTime
    addedAt_lt: DateTime
    role_gte: String
    addedAt_nin: [DateTime]
    addedAt_in: [DateTime]
  }

  input CollectInstallmentInput {
    _id: String
    clientGroupMeetingId: ObjectId
    loanId: ObjectId
    todaysRealization: Int
  }

  input DisburseLoanInput {
    loanId: String
    photo: LoanDisbursementPhotoQueryInput
    signatures: LoanSignatureQueryInput
    cheque: Boolean
  }

  input CollectInstallmentAsNonLoanOfficerInput {
    loanId: String
    installmentId: String
    realization: Int
    source: String
    mode: String
    argumentation: String
    cashCollectionDay: String
  }

  input WithdrawSecurityInput {
    clientId: String
    amount: Int
    argumentation: String
  }

  scalar JSON

  input EventInsertInput {
    _id: ObjectId
    objId: ObjectId
    payload: EventPayloadInsertInput
    userId: ObjectId
    importNotes: String
    importedAt: DateTime
    meta: String
    migration: String
    timestamp: DateTime
    importId: ObjectId
    obj: String
    type: String
    securityBalance: Int
  }

  input EventPayloadAddressInsertInput {
    area: String
    county: String
    district: String
    street: String
    subcounty: String
  }

  input EventPayloadAdmissionInsertInput {
    address: String
    notes: String
    smallBusinessLoan: Boolean
  }

  input EventPayloadAdvanceInstallmentInsertInput {
    durationValue: Int
    durationUnit: String
    installments: Int
  }

  input EventPayloadAttendanceInsertInput {
    attended: Boolean
    clientId: ObjectId
    firstName: String
    lastName: String
    representative: Boolean
  }

  input EventPayloadContentDebtInsertInput {
    amount: Int
    source: String
  }

  input EventPayloadContentForecastCoreInsertInput {
    monthlyExpenditure: Int
    monthlyIncome: Int
    comment: String
  }

  input EventPayloadContentForecastInsertInput {
    core: EventPayloadContentForecastCoreInsertInput
    other: EventPayloadContentForecastOtherInsertInput
  }

  input EventPayloadContentForecastOtherInsertInput {
    monthlyExpenditure: Int
    monthlyIncome: Int
    comment: String
  }

  input EventPayloadContentGuarantorInsertInput {
    relation: String
    signature: String
    name: String
    nationalVoterIdNumber: String
    nationalVoterIdPhoto: EventPayloadContentGuarantorNationalVoterIdPhotoInsertInput
    photo: EventPayloadContentGuarantorPhotoInsertInput
  }

  input EventPayloadContentGuarantorNationalVoterIdPhotoInsertInput {
    uri: String
    lat: String
    lng: String
  }

  input EventPayloadContentGuarantorPhotoInsertInput {
    lat: String
    lng: String
    uri: String
  }

  input EventPayloadContentInsertInput {
    fatherOrHusbandName: String
    previousLoan: EventPayloadContentPreviousLoanInsertInput
    forecast: EventPayloadContentForecastInsertInput
    mobilePhoneNumber: String
    residence: EventPayloadContentResidenceInsertInput
    photo: EventPayloadContentPhotoInsertInput
    projects: [String]
    nationalVoterIdNumber: String
    utilization: EventPayloadContentUtilizationInsertInput
    inspection: [EventPayloadContentInspectionInsertInput]
    loanRequirements: [EventPayloadContentLoanRequirementInsertInput]
    dateOfBirth: DateTime
    occupation: String
    partnersConsent: Boolean
    work: EventPayloadContentWorkInsertInput
    guarantors: [EventPayloadContentGuarantorInsertInput]
    maritalStatus: String
    debt: EventPayloadContentDebtInsertInput
    loan: EventPayloadContentLoanInsertInput
    nationalVoterIdPhoto: EventPayloadContentNationalVoterIdPhotoInsertInput
    sex: String
  }

  input EventPayloadContentInspectionInsertInput {
    lat: String
    lng: String
    uri: String
  }

  input EventPayloadContentLoanDurationInput {
    value: Int
    unit: String
  }

  input EventPayloadContentLoanInsertInput {
    cashCollateral: Int
    cycle: Int
    duration: EventPayloadContentLoanDurationInput
    interestRate: Int
    name: String
    type: ObjectId
    amount: Int
  }

  input EventPayloadContentLoanRequirementInsertInput {
    name: String
    requirement: ObjectId
    uri: String
    lat: String
    lng: String
  }

  input EventPayloadContentNationalVoterIdPhotoInsertInput {
    lng: String
    uri: String
    lat: String
  }

  input EventPayloadContentPhotoInsertInput {
    lng: String
    uri: String
    lat: String
  }

  input EventPayloadContentPreviousLoanInsertInput {
    amount: Int
    cycle: String
    purpose: String
  }

  input EventPayloadContentResidenceInsertInput {
    subcounty: String
    area: String
    county: String
    district: String
    notes: String
  }

  input EventPayloadContentUtilizationDebtPaymentInsertInput {
    cost: Int
    security: String
    value: Int
  }

  input EventPayloadContentUtilizationEquipmentInsertInput {
    value: Int
    cost: Int
    security: String
  }

  input EventPayloadContentUtilizationExtensionInsertInput {
    cost: Int
    security: String
    value: Int
  }

  input EventPayloadContentUtilizationInsertInput {
    debtPayment: EventPayloadContentUtilizationDebtPaymentInsertInput
    equipment: EventPayloadContentUtilizationEquipmentInsertInput
    extension: EventPayloadContentUtilizationExtensionInsertInput
    other: EventPayloadContentUtilizationOtherInsertInput
    rent: EventPayloadContentUtilizationRentInsertInput
    workingCapital: EventPayloadContentUtilizationWorkingCapitalInsertInput
  }

  input EventPayloadContentUtilizationOtherInsertInput {
    cost: Int
    security: String
    value: Int
  }

  input EventPayloadContentUtilizationRentInsertInput {
    value: Int
    cost: Int
    security: String
  }

  input EventPayloadContentUtilizationWorkingCapitalInsertInput {
    cost: Int
    security: String
    value: Int
  }

  input EventPayloadContentWorkInsertInput {
    county: String
    district: String
    notes: String
    subcounty: String
    area: String
  }

  input EventPayloadDisbursementPhotoInsertInput {
    lng: String
    uri: String
    lat: String
  }

  input EventPayloadFormInsertInput {
    application: ObjectId
    inspection: ObjectId
  }

  input EventPayloadInitialLoanInsertInput {
    durationValue: Int
    durationUnit: String
    from: Int
    to: Int
  }

  input EventPayloadDurationInput {
    value: Int
    unit: String
  }

  input EventPayloadInsertInput {
    disbursementAt: DateTime
    requests: String
    unlockReason: String
    branchName: String
    startedAt: DateTime
    disbursement: String
    decidedAt: DateTime
    branchManagerId: ObjectId
    branchManagerName: String
    invitedAt: DateTime
    status: String
    name: String
    loanProduct: ObjectId
    dateIso: DateTime
    closed: Boolean
    address: EventPayloadAddressInsertInput
    applicationAt: DateTime
    locations: EventPayloadLocationInsertInput
    formType: String
    requiredGuarantors: EventPayloadRequiredGuarantorInsertInput
    edited: Boolean
    answer: String
    loanProductId: ObjectId
    clientId: ObjectId
    closingBalance: Int
    question: String
    interestRate: Int
    serviceCharge: [EventPayloadServiceChargeInsertInput]
    type: String
    loanProcessingFee: EventPayloadLoanProcessingFeeInsertInput
    lastName: String
    clientsActive: Int
    initOpeningBalance: Int
    loanId: ObjectId
    firstName: String
    code: String
    scheduledAt: DateTime
    clientsRegistered: Int
    yearly: Boolean
    feedbackId: ObjectId
    branchId: ObjectId
    others: EventPayloadOtherInsertInput
    comment: String
    clientGroupId: ObjectId
    admissionAt: DateTime
    cashCollateral: Int
    initialLoan: [EventPayloadInitialLoanInsertInput]
    previousYearly: Boolean
    openingBalance: Int
    photo: String
    duration: EventPayloadDurationInput
    fullPhoneNumber: String
    riskCover: String
    phoneNumber: String
    gracePeriod: Int
    secretaryId: ObjectId
    endAt: DateTime
    loanInsurance: Int
    date: String
    startAt: DateTime
    cashierId: ObjectId
    joinedAt: DateTime
    loanIncrementEachCycle: [EventPayloadLoanIncrementEachCycleInsertInput]
    addedAt: DateTime
    relatedFormId: ObjectId
    loanOfficerId: ObjectId
    previousStartAt: DateTime
    id: ObjectId
    disbursementPhoto: EventPayloadDisbursementPhotoInsertInput
    potentialClientsVerified: Boolean
    presidentId: ObjectId
    notes: String
    wasRejected: Boolean
    content: EventPayloadContentInsertInput
    limits: [EventPayloadLimitInsertInput]
    installments: [EventPayloadInstallmentInsertInput]
    admission: EventPayloadAdmissionInsertInput
    role: String
    value: String
    initDate: DateTime
    endedAt: DateTime
    label: String
    requiredDocuments: EventPayloadRequiredDocumentInsertInput
    passbookIdentifier: String
    loanOutstanding: Int
    payments: EventPayloadPaymentInsertInput
    managerDecisionAt: DateTime
    savingsBalance: Int
    loanGracePeriod: Int
    loanProductName: String
    clientGroupName: String
    firstLoanDisbursement: Int
    requestedAmount: Int
    advanceInstallments: [EventPayloadAdvanceInstallmentInsertInput]
    signatures: EventPayloadSignatureInsertInput
    receipts: EventPayloadReceiptInsertInput
    attendance: [EventPayloadAttendanceInsertInput]
    photoUrl: String
    previousEndAt: DateTime
    lastRenewalAt: DateTime
    forms: EventPayloadFormInsertInput
    cycle: Int
    submittedAt: DateTime
    approvedAmount: Int
    meeting: EventPayloadMeetingInsertInput
    passbook: Boolean
    loanOfficerName: String
    loans: [ObjectId]
    securityBalance: Int
  }

  input EventPayloadInstallmentInsertInput {
    installment: Int
    _id: ObjectId
    realization: Int
    overdue: Int
    principalOutstandingOpeningBalance: Int
    status: String
    approvedAmount: Int
    clientId: ObjectId
    principalOutstandingClosingBalance: Int
    interest: Int
    target: Int
    loanId: ObjectId
    principalRepayment: Int
    wasLate: Boolean
    due: DateTime
    todaysRealization: Int
    cumulativeRealization: Int
    overdueInstallments: Int
    total: Int
    openingBalance: Int
    durationValue: Int
    durationUnit: String
  }

  input EventPayloadLimitInsertInput {
    durationValue: Int
    durationUnit: String
    limit: Int
  }

  input EventPayloadLoanIncrementEachCycleInsertInput {
    durationValue: Int
    durationUnit: String
    from: Int
    to: Int
  }

  input EventPayloadLoanProcessingFeeInsertInput {
    type: String
    value: Int
  }

  input EventPayloadLocationDecisionInsertInput {
    lng: String
    lat: String
  }

  input EventPayloadLocationInsertInput {
    submission: EventPayloadLocationSubmissionInsertInput
    decision: EventPayloadLocationDecisionInsertInput
    start: EventPayloadLocationStartInsertInput
  }

  input EventPayloadLocationStartInsertInput {
    lat: String
    lng: String
  }

  input EventPayloadLocationSubmissionInsertInput {
    lng: String
    lat: String
  }

  input EventPayloadMeetingInsertInput {
    time: String
    address: String
    dayOfWeek: Int
    frequency: String
    lat: String
    lng: String
    startedAt: DateTime
  }

  input EventPayloadOtherInsertInput {
    outreach: String
    servicingBanks: String
    majorCompetitors: String
  }

  input EventPayloadPaymentExpenseInsertInput {
    staffTransport: Int
    rubbishCollection: Int
    staffAirtime: Int
    utilities: Int
    staffAirtimeNotes: String
    utilitiesNotes: String
    staffLunch: Int
    insuranceClaimNotes: String
    staffLunchNotes: String
    internet: Int
    officeManagementNotes: String
    miscellaneous: Int
    officeManagement: Int
    rent: Int
    miscellaneousNotes: String
    insuranceClaim: Int
    rubbishCollectionNotes: String
    staffTransportNotes: String
    internetNotes: String
    rentNotes: String
  }

  input EventPayloadPaymentInsertInput {
    bankDepositNotes: String
    loanDisbursements: Int
    securityWithdrawals: Int
    securityReturnNotes: String
    toHeadOffice: Int
    expenses: EventPayloadPaymentExpenseInsertInput
    toHeadOfficeNotes: String
    toOtherBranchesNotes: String
    bankDeposit: Int
    securityReturn: Int
    toOtherBranches: Int
  }

  input EventPayloadReceiptInsertInput {
    fromHeadOffice: Int
    loanRelatedFundsReceived: Int
    otherIncomeNotes: String
    bankWithdrawal: Int
    bankWithdrawalNotes: String
    fromHeadOfficeNotes: String
    fromOtherBranches: Int
    fromOtherBranchesNotes: String
    otherIncome: Int
  }

  input EventPayloadRequiredDocumentFurtherLoanInsertInput {
    _id: ObjectId
    name: String
  }

  input EventPayloadRequiredDocumentInitialLoanInsertInput {
    name: String
    _id: ObjectId
  }

  input EventPayloadRequiredDocumentInsertInput {
    furtherLoans: [EventPayloadRequiredDocumentFurtherLoanInsertInput]
    initialLoan: [EventPayloadRequiredDocumentInitialLoanInsertInput]
  }

  input EventPayloadRequiredGuarantorInsertInput {
    family: Int
    group: Int
  }

  input EventPayloadServiceChargeInsertInput {
    charge: Int
    durationValue: Int
    durationUnit: String
  }

  input EventPayloadSignatureInsertInput {
    branchManager: String
    client: String
    employee: String
    loanOfficer: String
    witnesses: [EventPayloadSignatureWitnessInsertInput]
  }

  input EventPayloadSignatureWitnessInsertInput {
    name: String
    signature: String
  }

  input ExportCashAtHandReportInput {
    end: String
    start: String
  }

  input FeedbackQueryInput {
    comment_gte: String
    loanOfficerId_exists: Boolean
    question: String
    answer_lte: String
    createdAt_lt: DateTime
    answer_ne: String
    question_ne: String
    question_in: [String]
    _id: ObjectId
    loanId: LoanQueryInput
    answer_lt: String
    updatedAt_gte: DateTime
    _id_gte: ObjectId
    createdAt_nin: [DateTime]
    answer_gte: String
    loanOfficerId: UserQueryInput
    comment_lte: String
    createdAt_in: [DateTime]
    answer_gt: String
    clientId_exists: Boolean
    updatedAt_lt: DateTime
    loanId_exists: Boolean
    _id_lte: ObjectId
    comment_in: [String]
    updatedAt_in: [DateTime]
    comment_exists: Boolean
    updatedAt_lte: DateTime
    _id_exists: Boolean
    updatedAt_ne: DateTime
    label_in: [String]
    answer_exists: Boolean
    _id_lt: ObjectId
    updatedAt_nin: [DateTime]
    question_lte: String
    _id_ne: ObjectId
    label_gte: String
    label_lt: String
    branchId_exists: Boolean
    comment_gt: String
    answer_in: [String]
    _id_gt: ObjectId
    clientId: ClientQueryInput
    label: String
    _id_nin: [ObjectId]
    updatedAt_gt: DateTime
    createdAt_exists: Boolean
    label_exists: Boolean
    AND: [FeedbackQueryInput!]
    question_gt: String
    label_nin: [String]
    branchId: BranchQueryInput
    createdAt_gt: DateTime
    comment_ne: String
    updatedAt_exists: Boolean
    question_gte: String
    question_exists: Boolean
    label_lte: String
    _id_in: [ObjectId]
    createdAt_gte: DateTime
    updatedAt: DateTime
    answer_nin: [String]
    createdAt_lte: DateTime
    answer: String
    question_nin: [String]
    comment: String
    createdAt: DateTime
    OR: [FeedbackQueryInput!]
    label_ne: String
    comment_nin: [String]
    comment_lt: String
    question_lt: String
    label_gt: String
    createdAt_ne: DateTime
  }

  input FormContentDebtQueryInput {
    amount_gte: Int
    amount_gt: Int
    OR: [FormContentDebtQueryInput!]
    amount: Int
    source_nin: [String]
    AND: [FormContentDebtQueryInput!]
    amount_ne: Int
    source: String
    source_lt: String
    amount_nin: [Int]
    amount_exists: Boolean
    source_exists: Boolean
    source_ne: String
    amount_in: [Int]
    source_gt: String
    amount_lt: Int
    source_in: [String]
    amount_lte: Int
    source_gte: String
    source_lte: String
  }

  input FormContentForecastCoreQueryInput {
    monthlyExpenditure_ne: Int
    monthlyExpenditure_gte: Int
    monthlyExpenditure_lte: Int
    monthlyIncome_gte: Int
    comment_in: [String]
    monthlyIncome_lte: Int
    comment_gte: String
    comment: String
    monthlyIncome_in: [Int]
    monthlyExpenditure_gt: Int
    monthlyExpenditure_in: [Int]
    comment_gt: String
    monthlyIncome_gt: Int
    comment_lte: String
    monthlyIncome: Int
    monthlyExpenditure_nin: [Int]
    monthlyIncome_ne: Int
    comment_nin: [String]
    AND: [FormContentForecastCoreQueryInput!]
    comment_ne: String
    monthlyIncome_exists: Boolean
    OR: [FormContentForecastCoreQueryInput!]
    monthlyIncome_lt: Int
    monthlyIncome_nin: [Int]
    monthlyExpenditure: Int
    monthlyExpenditure_lt: Int
    comment_lt: String
    monthlyExpenditure_exists: Boolean
    comment_exists: Boolean
  }

  input FormContentForecastOtherQueryInput {
    monthlyIncome_lte: Int
    monthlyIncome_exists: Boolean
    OR: [FormContentForecastOtherQueryInput!]
    monthlyExpenditure_exists: Boolean
    monthlyIncome_nin: [Int]
    monthlyIncome: Int
    monthlyExpenditure_in: [Int]
    monthlyIncome_gt: Int
    monthlyIncome_gte: Int
    comment_exists: Boolean
    monthlyExpenditure: Int
    monthlyExpenditure_nin: [Int]
    monthlyExpenditure_ne: Int
    monthlyIncome_ne: Int
    comment_gte: String
    comment_ne: String
    comment_in: [String]
    monthlyIncome_in: [Int]
    monthlyExpenditure_lte: Int
    monthlyIncome_lt: Int
    monthlyExpenditure_gte: Int
    comment_nin: [String]
    AND: [FormContentForecastOtherQueryInput!]
    comment: String
    comment_gt: String
    comment_lt: String
    monthlyExpenditure_gt: Int
    monthlyExpenditure_lt: Int
    comment_lte: String
  }

  input FormContentForecastQueryInput {
    other: FormContentForecastOtherQueryInput
    other_exists: Boolean
    AND: [FormContentForecastQueryInput!]
    OR: [FormContentForecastQueryInput!]
    core: FormContentForecastCoreQueryInput
    core_exists: Boolean
  }

  input FormContentGuarantorNationalVoterIdPhotoQueryInput {
    lat_nin: [String]
    lat_lte: String
    lat_exists: Boolean
    lng: String
    lng_lt: String
    lng_exists: Boolean
    lng_nin: [String]
    uri_exists: Boolean
    lng_ne: String
    lat_gte: String
    lng_gte: String
    uri_gte: String
    lng_lte: String
    uri_lt: String
    uri_nin: [String]
    uri_ne: String
    lat_gt: String
    lat_ne: String
    lat_lt: String
    uri: String
    AND: [FormContentGuarantorNationalVoterIdPhotoQueryInput!]
    uri_in: [String]
    lat: String
    lat_in: [String]
    uri_gt: String
    uri_lte: String
    lng_in: [String]
    lng_gt: String
    OR: [FormContentGuarantorNationalVoterIdPhotoQueryInput!]
  }

  input FormContentGuarantorPhotoQueryInput {
    lng_gte: String
    lat_lte: String
    uri_gte: String
    lng_in: [String]
    lng_lt: String
    lat: String
    lat_nin: [String]
    lat_exists: Boolean
    uri_ne: String
    uri_lte: String
    lng: String
    lng_nin: [String]
    uri_in: [String]
    uri_lt: String
    lng_gt: String
    lng_exists: Boolean
    uri_nin: [String]
    AND: [FormContentGuarantorPhotoQueryInput!]
    lng_ne: String
    lng_lte: String
    OR: [FormContentGuarantorPhotoQueryInput!]
    lat_gte: String
    uri_gt: String
    uri_exists: Boolean
    lat_ne: String
    lat_gt: String
    uri: String
    lat_lt: String
    lat_in: [String]
  }

  input FormContentGuarantorQueryInput {
    name_lte: String
    signature_gt: String
    relation_gt: String
    relation_lt: String
    nationalVoterIdNumber_in: [String]
    signature_nin: [String]
    name: String
    name_gt: String
    nationalVoterIdNumber_lt: String
    signature_lte: String
    OR: [FormContentGuarantorQueryInput!]
    photo_exists: Boolean
    nationalVoterIdNumber_lte: String
    photo: FormContentGuarantorPhotoQueryInput
    signature_exists: Boolean
    name_exists: Boolean
    nationalVoterIdNumber_exists: Boolean
    signature_in: [String]
    nationalVoterIdNumber_gte: String
    relation_gte: String
    nationalVoterIdNumber_ne: String
    name_in: [String]
    relation_exists: Boolean
    name_gte: String
    nationalVoterIdPhoto: FormContentGuarantorNationalVoterIdPhotoQueryInput
    signature_gte: String
    relation: String
    relation_nin: [String]
    nationalVoterIdPhoto_exists: Boolean
    signature: String
    nationalVoterIdNumber: String
    name_nin: [String]
    nationalVoterIdNumber_nin: [String]
    relation_lte: String
    name_lt: String
    nationalVoterIdNumber_gt: String
    AND: [FormContentGuarantorQueryInput!]
    relation_ne: String
    name_ne: String
    relation_in: [String]
    signature_lt: String
    signature_ne: String
  }

  input FormContentInspectionQueryInput {
    uri_in: [String]
    uri_ne: String
    lng_ne: String
    lat_lte: String
    lat_lt: String
    lng_nin: [String]
    lat_nin: [String]
    lng_lt: String
    lat_gte: String
    uri: String
    lng_gt: String
    uri_exists: Boolean
    lng_in: [String]
    lng: String
    uri_lte: String
    lng_exists: Boolean
    uri_gte: String
    lng_gte: String
    lat_gt: String
    OR: [FormContentInspectionQueryInput!]
    lat: String
    uri_gt: String
    lat_exists: Boolean
    lat_ne: String
    AND: [FormContentInspectionQueryInput!]
    uri_lt: String
    uri_nin: [String]
    lng_lte: String
    lat_in: [String]
  }

  input FormContentLoanRequirementQueryInput {
    requirement_in: [ObjectId]
    uri_exists: Boolean
    name_gt: String
    name_in: [String]
    requirement_lte: ObjectId
    uri_ne: String
    requirement_gte: ObjectId
    requirement: ObjectId
    lat_nin: [String]
    lng_gt: String
    lng_exists: Boolean
    uri_in: [String]
    uri_gte: String
    lat_gte: String
    lng_lt: String
    uri_nin: [String]
    uri_lte: String
    lat_lt: String
    lng_nin: [String]
    requirement_lt: ObjectId
    name_lte: String
    lat: String
    name_lt: String
    AND: [FormContentLoanRequirementQueryInput!]
    lng_lte: String
    lng_gte: String
    name: String
    requirement_nin: [ObjectId]
    lng: String
    requirement_ne: ObjectId
    OR: [FormContentLoanRequirementQueryInput!]
    name_gte: String
    requirement_gt: ObjectId
    name_nin: [String]
    lat_exists: Boolean
    lat_ne: String
    uri_lt: String
    uri_gt: String
    lng_ne: String
    name_ne: String
    lat_in: [String]
    lat_lte: String
    requirement_exists: Boolean
    lng_in: [String]
    uri: String
    lat_gt: String
    name_exists: Boolean
  }

  input FormContentLoanQueryInput {
    interestRate_nin: [Int]
    name: String
    amount_nin: [Int]
    cashCollateral_gt: Int
    cashCollateral_gte: Int
    duration_nin: [Int]
    name_gt: String
    cycle_exists: Boolean
    cashCollateral_ne: Int
    type_lte: ObjectId
    amount_lte: Int
    amount_gt: Int
    cycle_gte: Int
    duration: Int
    amount_ne: Int
    cycle_in: [Int]
    type_gt: ObjectId
    interestRate_exists: Boolean
    name_lte: String
    name_in: [String]
    duration_lt: Int
    duration_exists: Boolean
    OR: [FormContentLoanQueryInput!]
    name_nin: [String]
    interestRate_lt: Int
    duration_ne: Int
    name_gte: String
    amount: Int
    duration_lte: Int
    interestRate: Int
    amount_lt: Int
    cycle_gt: Int
    cycle_lte: Int
    type_exists: Boolean
    cashCollateral_lt: Int
    interestRate_in: [Int]
    cashCollateral_nin: [Int]
    type_nin: [ObjectId]
    type_ne: ObjectId
    duration_gte: Int
    cashCollateral: Int
    duration_gt: Int
    interestRate_lte: Int
    cycle: Int
    cashCollateral_exists: Boolean
    amount_in: [Int]
    duration_in: [Int]
    interestRate_ne: Int
    interestRate_gt: Int
    cycle_nin: [Int]
    amount_gte: Int
    name_ne: String
    name_exists: Boolean
    name_lt: String
    type_gte: ObjectId
    cashCollateral_in: [Int]
    amount_exists: Boolean
    type: ObjectId
    cashCollateral_lte: Int
    AND: [FormContentLoanQueryInput!]
    cycle_ne: Int
    cycle_lt: Int
    interestRate_gte: Int
    type_lt: ObjectId
    type_in: [ObjectId]
  }

  input FormContentNationalVoterIdPhotoQueryInput {
    lng_exists: Boolean
    lng_ne: String
    uri_lte: String
    lng_nin: [String]
    lat_lt: String
    AND: [FormContentNationalVoterIdPhotoQueryInput!]
    lat_gt: String
    lng: String
    uri_gt: String
    uri_gte: String
    lng_lte: String
    lat_gte: String
    lat_in: [String]
    lat_nin: [String]
    OR: [FormContentNationalVoterIdPhotoQueryInput!]
    lng_gt: String
    lng_lt: String
    uri_ne: String
    lng_gte: String
    uri: String
    lat_ne: String
    lat: String
    lng_in: [String]
    uri_exists: Boolean
    uri_nin: [String]
    lat_lte: String
    lat_exists: Boolean
    uri_lt: String
    uri_in: [String]
  }

  input FormContentPhotoQueryInput {
    lat_nin: [String]
    lat_in: [String]
    lng_exists: Boolean
    lng_gt: String
    lat_gt: String
    OR: [FormContentPhotoQueryInput!]
    lat_exists: Boolean
    uri_lt: String
    lat_gte: String
    lng_gte: String
    lat_lt: String
    lng_ne: String
    lng_nin: [String]
    AND: [FormContentPhotoQueryInput!]
    uri_ne: String
    lng_in: [String]
    lng_lt: String
    uri_exists: Boolean
    lng_lte: String
    uri_nin: [String]
    uri: String
    uri_gt: String
    lng: String
    lat_ne: String
    uri_lte: String
    lat: String
    uri_gte: String
    lat_lte: String
    uri_in: [String]
  }

  input FormContentPreviousLoanQueryInput {
    amount_ne: Int
    amount_exists: Boolean
    AND: [FormContentPreviousLoanQueryInput!]
    cycle_exists: Boolean
    purpose_nin: [String]
    purpose_ne: String
    purpose_gte: String
    cycle: String
    cycle_gt: String
    purpose_lt: String
    purpose_lte: String
    cycle_ne: String
    amount_gt: Int
    purpose: String
    OR: [FormContentPreviousLoanQueryInput!]
    amount_nin: [Int]
    amount_gte: Int
    cycle_gte: String
    amount: Int
    amount_lt: Int
    cycle_in: [String]
    amount_in: [Int]
    purpose_gt: String
    purpose_in: [String]
    cycle_nin: [String]
    amount_lte: Int
    cycle_lt: String
    cycle_lte: String
    purpose_exists: Boolean
  }

  input FormContentQueryInput {
    loanRequirements_nin: [FormContentLoanRequirementQueryInput]
    maritalStatus_gt: String
    work: FormContentWorkQueryInput
    projects_exists: Boolean
    occupation_lte: String
    utilization: FormContentUtilizationQueryInput
    nationalVoterIdPhoto_exists: Boolean
    occupation_in: [String]
    fatherOrHusbandName_lt: String
    dateOfBirth_exists: Boolean
    maritalStatus: String
    photo: FormContentPhotoQueryInput
    inspection_in: [FormContentInspectionQueryInput]
    debt_exists: Boolean
    mobilePhoneNumber_in: [String]
    loan: FormContentLoanQueryInput
    residence: FormContentResidenceQueryInput
    mobilePhoneNumber_lte: String
    mobilePhoneNumber_ne: String
    dateOfBirth: DateTime
    sex_in: [String]
    guarantors_in: [FormContentGuarantorQueryInput]
    occupation: String
    inspection_nin: [FormContentInspectionQueryInput]
    AND: [FormContentQueryInput!]
    sex_lt: String
    loanRequirements_exists: Boolean
    OR: [FormContentQueryInput!]
    loanId_ne: ObjectId
    projects: [String]
    maritalStatus_ne: String
    dateOfBirth_ne: DateTime
    loanRequirements_in: [FormContentLoanRequirementQueryInput]
    maritalStatus_nin: [String]
    dateOfBirth_gte: DateTime
    fatherOrHusbandName_nin: [String]
    inspection: [FormContentInspectionQueryInput]
    sex_gte: String
    occupation_nin: [String]
    dateOfBirth_lt: DateTime
    guarantors_exists: Boolean
    partnersConsent_ne: Boolean
    fatherOrHusbandName_exists: Boolean
    guarantors_nin: [FormContentGuarantorQueryInput]
    fatherOrHusbandName_gt: String
    nationalVoterIdNumber_lte: String
    occupation_gt: String
    previousLoan_exists: Boolean
    mobilePhoneNumber_lt: String
    dateOfBirth_lte: DateTime
    guarantors: [FormContentGuarantorQueryInput]
    partnersConsent: Boolean
    loanId_in: [ObjectId]
    sex_ne: String
    maritalStatus_exists: Boolean
    photo_exists: Boolean
    maritalStatus_gte: String
    utilization_exists: Boolean
    nationalVoterIdNumber_lt: String
    nationalVoterIdNumber_ne: String
    fatherOrHusbandName_gte: String
    loanId_gte: ObjectId
    inspection_exists: Boolean
    nationalVoterIdPhoto: FormContentNationalVoterIdPhotoQueryInput
    loanId_nin: [ObjectId]
    mobilePhoneNumber_gt: String
    occupation_exists: Boolean
    projects_nin: [String]
    loanId: ObjectId
    previousLoan: FormContentPreviousLoanQueryInput
    dateOfBirth_gt: DateTime
    fatherOrHusbandName_lte: String
    mobilePhoneNumber_exists: Boolean
    loanRequirements: [FormContentLoanRequirementQueryInput]
    fatherOrHusbandName_ne: String
    fatherOrHusbandName_in: [String]
    nationalVoterIdNumber: String
    occupation_lt: String
    loanId_lt: ObjectId
    maritalStatus_lte: String
    work_exists: Boolean
    residence_exists: Boolean
    partnersConsent_exists: Boolean
    loan_exists: Boolean
    projects_in: [String]
    sex: String
    sex_gt: String
    forecast: FormContentForecastQueryInput
    dateOfBirth_nin: [DateTime]
    nationalVoterIdNumber_gte: String
    debt: FormContentDebtQueryInput
    occupation_ne: String
    sex_lte: String
    mobilePhoneNumber: String
    fatherOrHusbandName: String
    nationalVoterIdNumber_exists: Boolean
    forecast_exists: Boolean
    nationalVoterIdNumber_in: [String]
    loanId_lte: ObjectId
    nationalVoterIdNumber_gt: String
    sex_nin: [String]
    dateOfBirth_in: [DateTime]
    sex_exists: Boolean
    maritalStatus_lt: String
    occupation_gte: String
    mobilePhoneNumber_nin: [String]
    loanId_exists: Boolean
    nationalVoterIdNumber_nin: [String]
    loanId_gt: ObjectId
    maritalStatus_in: [String]
    mobilePhoneNumber_gte: String
  }

  input FormContentResidenceQueryInput {
    subcounty_in: [String]
    county_gte: String
    subcounty_lt: String
    county_nin: [String]
    notes_in: [String]
    district_lt: String
    area: String
    district_ne: String
    subcounty_gte: String
    county_in: [String]
    county_lte: String
    subcounty_nin: [String]
    area_ne: String
    county_ne: String
    AND: [FormContentResidenceQueryInput!]
    OR: [FormContentResidenceQueryInput!]
    district_in: [String]
    subcounty_ne: String
    district: String
    notes_nin: [String]
    county_gt: String
    subcounty_lte: String
    district_nin: [String]
    area_gt: String
    notes_lte: String
    area_lte: String
    area_nin: [String]
    district_lte: String
    subcounty: String
    subcounty_exists: Boolean
    notes_gte: String
    notes_ne: String
    county: String
    district_exists: Boolean
    notes_lt: String
    subcounty_gt: String
    notes_exists: Boolean
    area_in: [String]
    county_lt: String
    area_exists: Boolean
    area_lt: String
    notes_gt: String
    area_gte: String
    county_exists: Boolean
    notes: String
    district_gte: String
    district_gt: String
  }

  input FormContentUtilizationDebtPaymentQueryInput {
    value_in: [Int]
    security: String
    cost_nin: [Int]
    security_nin: [String]
    cost_ne: Int
    value_nin: [Int]
    cost_gt: Int
    value_ne: Int
    security_in: [String]
    value_gt: Int
    security_gt: String
    value: Int
    value_exists: Boolean
    cost_in: [Int]
    value_lte: Int
    AND: [FormContentUtilizationDebtPaymentQueryInput!]
    security_exists: Boolean
    cost_lte: Int
    security_gte: String
    security_lt: String
    cost: Int
    security_lte: String
    cost_gte: Int
    cost_exists: Boolean
    cost_lt: Int
    OR: [FormContentUtilizationDebtPaymentQueryInput!]
    value_lt: Int
    security_ne: String
    value_gte: Int
  }

  input FormContentUtilizationEquipmentQueryInput {
    security_gt: String
    cost_ne: Int
    value_nin: [Int]
    security: String
    cost_lt: Int
    value_gte: Int
    AND: [FormContentUtilizationEquipmentQueryInput!]
    value_gt: Int
    security_ne: String
    OR: [FormContentUtilizationEquipmentQueryInput!]
    security_in: [String]
    cost_exists: Boolean
    value_ne: Int
    security_lte: String
    value_lte: Int
    cost_lte: Int
    security_lt: String
    security_nin: [String]
    security_exists: Boolean
    cost_in: [Int]
    value_in: [Int]
    cost: Int
    cost_gt: Int
    cost_gte: Int
    value: Int
    value_exists: Boolean
    value_lt: Int
    security_gte: String
    cost_nin: [Int]
  }

  input FormContentUtilizationExtensionQueryInput {
    security_lte: String
    cost_exists: Boolean
    cost: Int
    cost_in: [Int]
    cost_nin: [Int]
    AND: [FormContentUtilizationExtensionQueryInput!]
    value_lte: Int
    security_gte: String
    cost_gt: Int
    cost_lte: Int
    value_ne: Int
    cost_gte: Int
    security_nin: [String]
    value_in: [Int]
    cost_lt: Int
    security_ne: String
    value: Int
    security_lt: String
    value_lt: Int
    security_in: [String]
    value_exists: Boolean
    security: String
    security_gt: String
    value_nin: [Int]
    value_gte: Int
    OR: [FormContentUtilizationExtensionQueryInput!]
    value_gt: Int
    security_exists: Boolean
    cost_ne: Int
  }

  input FormContentUtilizationOtherQueryInput {
    security_gte: String
    AND: [FormContentUtilizationOtherQueryInput!]
    value_lt: Int
    cost_gt: Int
    cost_lt: Int
    security_ne: String
    value_gt: Int
    value_exists: Boolean
    OR: [FormContentUtilizationOtherQueryInput!]
    value_in: [Int]
    cost_gte: Int
    security_exists: Boolean
    cost_nin: [Int]
    value: Int
    security: String
    security_lt: String
    cost_exists: Boolean
    cost_in: [Int]
    value_ne: Int
    cost_lte: Int
    value_gte: Int
    cost_ne: Int
    cost: Int
    security_in: [String]
    security_nin: [String]
    security_gt: String
    security_lte: String
    value_nin: [Int]
    value_lte: Int
  }

  input FormContentUtilizationRentQueryInput {
    cost_gt: Int
    security_lt: String
    cost_lte: Int
    cost_gte: Int
    value_nin: [Int]
    cost_in: [Int]
    value_in: [Int]
    cost_nin: [Int]
    value_gte: Int
    security_exists: Boolean
    cost_exists: Boolean
    value_ne: Int
    OR: [FormContentUtilizationRentQueryInput!]
    security_nin: [String]
    security_ne: String
    value_gt: Int
    cost: Int
    cost_ne: Int
    security: String
    security_in: [String]
    AND: [FormContentUtilizationRentQueryInput!]
    cost_lt: Int
    security_gte: String
    security_lte: String
    value: Int
    value_exists: Boolean
    value_lt: Int
    value_lte: Int
    security_gt: String
  }

  input FormContentUtilizationWorkingCapitalQueryInput {
    AND: [FormContentUtilizationWorkingCapitalQueryInput!]
    cost_lte: Int
    security_lt: String
    cost: Int
    cost_gt: Int
    security_nin: [String]
    security_in: [String]
    value_gt: Int
    value_gte: Int
    security: String
    cost_nin: [Int]
    security_exists: Boolean
    value_lt: Int
    OR: [FormContentUtilizationWorkingCapitalQueryInput!]
    security_gt: String
    cost_ne: Int
    cost_gte: Int
    cost_exists: Boolean
    security_ne: String
    value_lte: Int
    value_nin: [Int]
    value_ne: Int
    security_gte: String
    value: Int
    value_exists: Boolean
    cost_in: [Int]
    security_lte: String
    cost_lt: Int
    value_in: [Int]
  }

  input FormContentUtilizationQueryInput {
    AND: [FormContentUtilizationQueryInput!]
    debtPayment: FormContentUtilizationDebtPaymentQueryInput
    equipment: FormContentUtilizationEquipmentQueryInput
    rent_exists: Boolean
    extension_exists: Boolean
    other: FormContentUtilizationOtherQueryInput
    debtPayment_exists: Boolean
    extension: FormContentUtilizationExtensionQueryInput
    other_exists: Boolean
    workingCapital_exists: Boolean
    workingCapital: FormContentUtilizationWorkingCapitalQueryInput
    rent: FormContentUtilizationRentQueryInput
    OR: [FormContentUtilizationQueryInput!]
    equipment_exists: Boolean
  }

  input FormContentWorkQueryInput {
    county_in: [String]
    district_exists: Boolean
    OR: [FormContentWorkQueryInput!]
    county_gt: String
    district_ne: String
    subcounty_gt: String
    county_gte: String
    subcounty_lt: String
    area_in: [String]
    notes_ne: String
    county_nin: [String]
    subcounty_in: [String]
    district_in: [String]
    district_nin: [String]
    subcounty: String
    subcounty_nin: [String]
    county_lte: String
    area: String
    county_lt: String
    district_lt: String
    notes_gt: String
    notes_lte: String
    area_exists: Boolean
    district_lte: String
    district: String
    area_ne: String
    notes_nin: [String]
    area_gte: String
    notes_gte: String
    notes_lt: String
    county_exists: Boolean
    area_lt: String
    area_gt: String
    notes_exists: Boolean
    subcounty_gte: String
    notes_in: [String]
    subcounty_ne: String
    subcounty_lte: String
    subcounty_exists: Boolean
    AND: [FormContentWorkQueryInput!]
    area_lte: String
    county: String
    county_ne: String
    district_gt: String
    area_nin: [String]
    notes: String
    district_gte: String
  }

  input FormLocationStartQueryInput {
    lat_in: [String]
    lng_gte: String
    lat_lt: String
    lng_nin: [String]
    lat: String
    lat_lte: String
    lat_nin: [String]
    lat_ne: String
    lng: String
    lat_gte: String
    lat_exists: Boolean
    lng_lte: String
    lng_ne: String
    lng_in: [String]
    OR: [FormLocationStartQueryInput!]
    lng_exists: Boolean
    lat_gt: String
    lng_gt: String
    lng_lt: String
    AND: [FormLocationStartQueryInput!]
  }

  input FormLocationSubmissionQueryInput {
    lat_gt: String
    lat_lte: String
    lat_in: [String]
    lng_gt: String
    lng_lte: String
    lng_ne: String
    lat_exists: Boolean
    lng_nin: [String]
    lat: String
    lng_exists: Boolean
    lng: String
    lng_gte: String
    lng_in: [String]
    AND: [FormLocationSubmissionQueryInput!]
    lat_nin: [String]
    OR: [FormLocationSubmissionQueryInput!]
    lng_lt: String
    lat_lt: String
    lat_ne: String
    lat_gte: String
  }

  input FormLocationQueryInput {
    submission: FormLocationSubmissionQueryInput
    submission_exists: Boolean
    AND: [FormLocationQueryInput!]
    OR: [FormLocationQueryInput!]
    start: FormLocationStartQueryInput
    start_exists: Boolean
  }

  input FormQueryInput {
    status_in: [String]
    status_ne: String
    status_lte: String
    type_gte: String
    relatedFormId_ne: ObjectId
    AND: [FormQueryInput!]
    updatedAt: DateTime
    type_gt: String
    relatedFormId_nin: [ObjectId]
    _id_gt: ObjectId
    relatedFormId: ObjectId
    status_gt: String
    createdAt_lte: DateTime
    createdAt_in: [DateTime]
    notes_nin: [String]
    feedbackId: FeedbackQueryInput
    relatedFormId_gte: ObjectId
    updatedAt_lt: DateTime
    relatedFormId_exists: Boolean
    notes: String
    code_lte: String
    type: String
    createdAt_exists: Boolean
    clientId: ClientQueryInput
    _id_ne: ObjectId
    code_ne: String
    lastEventId_in: [ObjectId]
    notes_gt: String
    createdAt_lt: DateTime
    status: String
    notes_ne: String
    type_lt: String
    lastEventId_nin: [ObjectId]
    lastEventId_ne: ObjectId
    createdAt_ne: DateTime
    createdAt_gt: DateTime
    relatedFormId_lte: ObjectId
    code_gte: String
    relatedFormId_in: [ObjectId]
    status_lt: String
    code_exists: Boolean
    signatures_exists: Boolean
    _id_gte: ObjectId
    createdAt_gte: DateTime
    updatedAt_nin: [DateTime]
    updatedAt_gt: DateTime
    _id_lte: ObjectId
    createdAt: DateTime
    updatedAt_ne: DateTime
    clientId_exists: Boolean
    content_exists: Boolean
    code_in: [String]
    loanId: LoanQueryInput
    _id_in: [ObjectId]
    signatures: FormSignatureQueryInput
    _id_exists: Boolean
    _id_lt: ObjectId
    loanId_exists: Boolean
    _id: ObjectId
    relatedFormId_lt: ObjectId
    locations_exists: Boolean
    updatedAt_lte: DateTime
    notes_lte: String
    lastEventId: ObjectId
    userId_exists: Boolean
    lastEventId_lt: ObjectId
    notes_in: [String]
    type_in: [String]
    code: String
    status_nin: [String]
    feedbackId_exists: Boolean
    userId: UserQueryInput
    status_gte: String
    updatedAt_gte: DateTime
    OR: [FormQueryInput!]
    relatedFormId_gt: ObjectId
    status_exists: Boolean
    notes_exists: Boolean
    code_gt: String
    _id_nin: [ObjectId]
    notes_gte: String
    lastEventId_lte: ObjectId
    code_nin: [String]
    type_exists: Boolean
    lastEventId_gt: ObjectId
    updatedAt_exists: Boolean
    lastEventId_exists: Boolean
    type_lte: String
    updatedAt_in: [DateTime]
    lastEventId_gte: ObjectId
    locations: FormLocationQueryInput
    notes_lt: String
    code_lt: String
    content: FormContentQueryInput
    type_nin: [String]
    type_ne: String
    createdAt_nin: [DateTime]
  }

  input FormSignatureQueryInput {
    OR: [FormSignatureQueryInput!]
    employee: String
    employee_exists: Boolean
    employee_nin: [String]
    employee_in: [String]
    client_in: [String]
    employee_ne: String
    client_lte: String
    client_gte: String
    employee_gt: String
    employee_lt: String
    client_gt: String
    client_ne: String
    employee_gte: String
    client: String
    employee_lte: String
    client_nin: [String]
    client_exists: Boolean
    client_lt: String
    AND: [FormSignatureQueryInput!]
  }

  input HolidayQueryInput {
    startAt_gt: DateTime
    endAt_exists: Boolean
    startAt_lt: DateTime
    _id_in: [ObjectId]
    startAt_exists: Boolean
    notes_in: [String]
    endAt_lt: DateTime
    endAt_in: [DateTime]
    name_gte: String
    name_ne: String
    name_in: [String]
    updatedAt_lte: DateTime
    startAt: DateTime
    name_gt: String
    notes_gt: String
    name_nin: [String]
    _id: ObjectId
    createdAt_in: [DateTime]
    _id_ne: ObjectId
    AND: [HolidayQueryInput!]
    name_lt: String
    startAt_ne: DateTime
    yearly: Boolean
    _id_nin: [ObjectId]
    endAt_nin: [DateTime]
    endAt_gt: DateTime
    startAt_nin: [DateTime]
    _id_gt: ObjectId
    updatedAt_gte: DateTime
    yearly_ne: Boolean
    updatedAt_nin: [DateTime]
    startAt_lte: DateTime
    updatedAt_gt: DateTime
    updatedAt_exists: Boolean
    endAt_ne: DateTime
    startAt_in: [DateTime]
    endAt: DateTime
    createdAt_lte: DateTime
    name_lte: String
    startAt_gte: DateTime
    createdAt: DateTime
    createdAt_gte: DateTime
    _id_exists: Boolean
    OR: [HolidayQueryInput!]
    notes_lt: String
    yearly_exists: Boolean
    createdAt_ne: DateTime
    name_exists: Boolean
    createdAt_lt: DateTime
    createdAt_exists: Boolean
    createdAt_nin: [DateTime]
    endAt_gte: DateTime
    createdAt_gt: DateTime
    updatedAt: DateTime
    _id_lt: ObjectId
    _id_lte: ObjectId
    _id_gte: ObjectId
    notes: String
    notes_exists: Boolean
    updatedAt_lt: DateTime
    updatedAt_ne: DateTime
    endAt_lte: DateTime
    name: String
    notes_ne: String
    notes_lte: String
    notes_nin: [String]
    notes_gte: String
    updatedAt_in: [DateTime]
  }

  input LoanDisbursementPhotoQueryInput {
    lat_gte: String
    lng: String
    lat_nin: [String]
    uri_lte: String
    lat_in: [String]
    lng_exists: Boolean
    uri_in: [String]
    lng_ne: String
    uri_gt: String
    uri_gte: String
    lat_lte: String
    uri_exists: Boolean
    lat_exists: Boolean
    lng_in: [String]
    uri_ne: String
    lng_nin: [String]
    uri: String
    lat_lt: String
    lat_ne: String
    uri_nin: [String]
    lng_lt: String
    uri_lt: String
    lng_lte: String
    lng_gte: String
    lat_gt: String
    lng_gt: String
    lat: String
    AND: [LoanDisbursementPhotoQueryInput!]
    OR: [LoanDisbursementPhotoQueryInput!]
  }

  input LoanFormQueryInput {
    AND: [LoanFormQueryInput!]
    OR: [LoanFormQueryInput!]
    application: FormQueryInput
    application_exists: Boolean
    inspection: FormQueryInput
    inspection_exists: Boolean
  }

  input LoanInstallmentQueryInput {
    status_lt: String
    _id_gte: ObjectId
    principalOutstandingClosingBalance_exists: Boolean
    target_exists: Boolean
    principalOutstandingClosingBalance_lte: Int
    realization_exists: Boolean
    _id_ne: ObjectId
    principalOutstandingOpeningBalance_gte: Int
    principalRepayment: Int
    _id: ObjectId
    principalOutstandingClosingBalance: Int
    due_ne: DateTime
    interest_in: [Int]
    due_in: [DateTime]
    due_lt: DateTime
    interest_lte: Int
    principalOutstandingClosingBalance_gt: Int
    realization_gt: Int
    realization_lte: Int
    target_lt: Int
    principalOutstandingOpeningBalance_in: [Int]
    total_gt: Int
    interest_ne: Int
    principalRepayment_lt: Int
    wasLate_exists: Boolean
    principalOutstandingOpeningBalance_ne: Int
    principalRepayment_ne: Int
    _id_lt: ObjectId
    realization_ne: Int
    status_exists: Boolean
    target_ne: Int
    status_lte: String
    realization_nin: [Int]
    realization_lt: Int
    _id_nin: [ObjectId]
    interest: Int
    total_in: [Int]
    principalOutstandingOpeningBalance: Int
    interest_lt: Int
    target: Int
    realization: Int
    wasLate: Boolean
    _id_gt: ObjectId
    due: DateTime
    _id_exists: Boolean
    realization_gte: Int
    principalOutstandingOpeningBalance_exists: Boolean
    principalOutstandingOpeningBalance_nin: [Int]
    status_ne: String
    total_exists: Boolean
    interest_gte: Int
    interest_exists: Boolean
    principalRepayment_nin: [Int]
    _id_lte: ObjectId
    interest_nin: [Int]
    principalOutstandingOpeningBalance_gt: Int
    principalRepayment_lte: Int
    due_gt: DateTime
    status_nin: [String]
    principalRepayment_gt: Int
    wasLate_ne: Boolean
    due_lte: DateTime
    due_exists: Boolean
    status_gt: String
    AND: [LoanInstallmentQueryInput!]
    principalRepayment_exists: Boolean
    principalOutstandingClosingBalance_nin: [Int]
    principalOutstandingOpeningBalance_lt: Int
    total_ne: Int
    total_lt: Int
    total_gte: Int
    principalOutstandingClosingBalance_lt: Int
    principalOutstandingClosingBalance_in: [Int]
    OR: [LoanInstallmentQueryInput!]
    principalOutstandingOpeningBalance_lte: Int
    status_in: [String]
    _id_in: [ObjectId]
    status: String
    principalRepayment_in: [Int]
    target_nin: [Int]
    target_in: [Int]
    total: Int
    total_lte: Int
    due_nin: [DateTime]
    target_lte: Int
    total_nin: [Int]
    interest_gt: Int
    status_gte: String
    target_gte: Int
    principalOutstandingClosingBalance_ne: Int
    due_gte: DateTime
    principalOutstandingClosingBalance_gte: Int
    target_gt: Int
    realization_in: [Int]
    principalRepayment_gte: Int
  }

  input LoanLoanProcessingFeeQueryInput {
    value_in: [Int]
    value_ne: Int
    OR: [LoanLoanProcessingFeeQueryInput!]
    type_lt: String
    type_nin: [String]
    value: Int
    value_nin: [Int]
    value_lte: Int
    value_exists: Boolean
    type: String
    type_ne: String
    type_gt: String
    value_lt: Int
    value_gt: Int
    AND: [LoanLoanProcessingFeeQueryInput!]
    value_gte: Int
    type_gte: String
    type_in: [String]
    type_exists: Boolean
    type_lte: String
  }

  input LoanProductAdvanceInstallmentQueryInput {
    duration_gt: Int
    duration_gte: Int
    duration: Int
    installments_gt: Int
    duration_in: [Int]
    duration_lte: Int
    installments_ne: Int
    installments_lt: Int
    installments_nin: [Int]
    installments_lte: Int
    duration_nin: [Int]
    installments_in: [Int]
    installments_exists: Boolean
    installments_gte: Int
    duration_exists: Boolean
    duration_lt: Int
    installments: Int
    OR: [LoanProductAdvanceInstallmentQueryInput!]
    duration_ne: Int
    AND: [LoanProductAdvanceInstallmentQueryInput!]
  }

  input LoanProductCashCollateralQueryInput {
    OR: [LoanProductCashCollateralQueryInput!]
    initialLoan_nin: [Decimal]
    initialLoan_lte: Decimal
    initialLoan_exists: Boolean
    furtherLoans: Decimal
    furtherLoans_lt: Decimal
    initialLoan_gte: Decimal
    furtherLoans_in: [Decimal]
    initialLoan_ne: Decimal
    furtherLoans_ne: Decimal
    initialLoan_in: [Decimal]
    AND: [LoanProductCashCollateralQueryInput!]
    initialLoan: Decimal
    furtherLoans_gt: Decimal
    furtherLoans_gte: Decimal
    furtherLoans_lte: Decimal
    initialLoan_gt: Decimal
    furtherLoans_nin: [Decimal]
    initialLoan_lt: Decimal
    furtherLoans_exists: Boolean
  }

  input LoanProductInitialLoanQueryInput {
    to_lt: Int
    duration_ne: Int
    to: Int
    from_ne: Int
    duration_nin: [Int]
    OR: [LoanProductInitialLoanQueryInput!]
    duration_in: [Int]
    duration_gte: Int
    from_lte: Int
    to_nin: [Int]
    to_gt: Int
    to_gte: Int
    from_in: [Int]
    from_gt: Int
    from: Int
    to_in: [Int]
    duration: Int
    from_lt: Int
    duration_gt: Int
    from_nin: [Int]
    AND: [LoanProductInitialLoanQueryInput!]
    duration_exists: Boolean
    to_exists: Boolean
    to_lte: Int
    from_gte: Int
    from_exists: Boolean
    duration_lte: Int
    to_ne: Int
    duration_lt: Int
  }

  input LoanProductLimitQueryInput {
    duration: Int
    limit_ne: Int
    OR: [LoanProductLimitQueryInput!]
    limit_exists: Boolean
    duration_in: [Int]
    duration_exists: Boolean
    limit_gte: Int
    AND: [LoanProductLimitQueryInput!]
    duration_nin: [Int]
    limit_in: [Int]
    limit: Int
    limit_lt: Int
    limit_gt: Int
    limit_nin: [Int]
    duration_gte: Int
    limit_lte: Int
    duration_lte: Int
    duration_gt: Int
    duration_lt: Int
    duration_ne: Int
  }

  input LoanProductLoanIncrementEachCycleQueryInput {
    from_lte: Int
    duration_lt: Int
    duration_gte: Int
    to_exists: Boolean
    from_lt: Int
    to_in: [Int]
    duration_in: [Int]
    from_nin: [Int]
    duration_gt: Int
    duration: Int
    duration_exists: Boolean
    from_gte: Int
    to: Int
    from: Int
    to_gt: Int
    to_gte: Int
    from_gt: Int
    AND: [LoanProductLoanIncrementEachCycleQueryInput!]
    to_ne: Int
    duration_lte: Int
    from_exists: Boolean
    to_lte: Int
    duration_nin: [Int]
    duration_ne: Int
    from_in: [Int]
    OR: [LoanProductLoanIncrementEachCycleQueryInput!]
    from_ne: Int
    to_lt: Int
    to_nin: [Int]
  }

  input LoanProductLoanProcessingFeeQueryInput {
    value_lt: Int
    type_nin: [String]
    type_gt: String
    value_nin: [Int]
    value_ne: Int
    OR: [LoanProductLoanProcessingFeeQueryInput!]
    type_gte: String
    type_lte: String
    value_gt: Int
    type_in: [String]
    type_lt: String
    type: String
    value_exists: Boolean
    type_ne: String
    value_gte: Int
    type_exists: Boolean
    AND: [LoanProductLoanProcessingFeeQueryInput!]
    value: Int
    value_in: [Int]
    value_lte: Int
  }

  input LoanProductQueryInput {
    initialLoan: [LoanProductInitialLoanQueryInput]
    firstLoanDisbursement_in: [Int]
    gracePeriod: Int
    status_lt: String
    initialLoan_nin: [LoanProductInitialLoanQueryInput]
    _id_in: [ObjectId]
    gracePeriod_lte: Int
    name_ne: String
    loanIncrementEachCycle: [LoanProductLoanIncrementEachCycleQueryInput]
    firstLoanDisbursement_lt: Int
    loanIncrementEachCycle_in: [LoanProductLoanIncrementEachCycleQueryInput]
    updatedAt_exists: Boolean
    firstLoanDisbursement: Int
    loanInsurance_ne: Int
    firstLoanDisbursement_lte: Int
    loanInsurance_gt: Int
    limits: [LoanProductLimitQueryInput]
    serviceCharge_in: [LoanProductServiceChargeQueryInput]
    serviceCharge_exists: Boolean
    loanIncrementEachCycle_exists: Boolean
    name_exists: Boolean
    createdAt_lte: DateTime
    firstLoanDisbursement_nin: [Int]
    _id_lt: ObjectId
    requiredDocuments_exists: Boolean
    limits_exists: Boolean
    name_lte: String
    name_nin: [String]
    firstLoanDisbursement_exists: Boolean
    loanIncrementEachCycle_nin: [LoanProductLoanIncrementEachCycleQueryInput]
    firstLoanDisbursement_gte: Int
    advanceInstallments: [LoanProductAdvanceInstallmentQueryInput]
    createdAt_in: [DateTime]
    loanProcessingFee: LoanProductLoanProcessingFeeQueryInput
    status_gt: String
    disbursement: String
    updatedAt_in: [DateTime]
    disbursement_gt: String
    riskCover_in: [String]
    initialLoan_in: [LoanProductInitialLoanQueryInput]
    riskCover_lte: String
    loanInsurance_nin: [Int]
    AND: [LoanProductQueryInput!]
    limits_nin: [LoanProductLimitQueryInput]
    durations_in: [Int]
    name: String
    name_gt: String
    advanceInstallments_nin: [LoanProductAdvanceInstallmentQueryInput]
    status_gte: String
    limits_in: [LoanProductLimitQueryInput]
    firstLoanDisbursement_gt: Int
    gracePeriod_lt: Int
    _id: ObjectId
    _id_nin: [ObjectId]
    name_gte: String
    cashCollateral_exists: Boolean
    status_ne: String
    createdAt_ne: DateTime
    name_in: [String]
    disbursement_gte: String
    advanceInstallments_exists: Boolean
    gracePeriod_gt: Int
    status_exists: Boolean
    gracePeriod_exists: Boolean
    initialLoan_exists: Boolean
    _id_gte: ObjectId
    loanInsurance_in: [Int]
    loanProcessingFee_exists: Boolean
    OR: [LoanProductQueryInput!]
    disbursement_lte: String
    serviceCharge: [LoanProductServiceChargeQueryInput]
    firstLoanDisbursement_ne: Int
    name_lt: String
    updatedAt_ne: DateTime
    gracePeriod_ne: Int
    updatedAt_nin: [DateTime]
    requiredDocuments: LoanProductRequiredDocumentQueryInput
    status: String
    updatedAt_lt: DateTime
    durations: [Int]
    riskCover_gt: String
    loanInsurance_lt: Int
    status_nin: [String]
    disbursement_lt: String
    riskCover_ne: String
    updatedAt_gt: DateTime
    loanInsurance_exists: Boolean
    durations_exists: Boolean
    status_in: [String]
    riskCover_exists: Boolean
    requiredGuarantors: LoanProductRequiredGuarantorQueryInput
    _id_exists: Boolean
    updatedAt: DateTime
    createdAt_gt: DateTime
    gracePeriod_nin: [Int]
    disbursement_exists: Boolean
    riskCover_lt: String
    riskCover: String
    disbursement_nin: [String]
    updatedAt_lte: DateTime
    cashCollateral: LoanProductCashCollateralQueryInput
    disbursement_ne: String
    updatedAt_gte: DateTime
    _id_gt: ObjectId
    gracePeriod_gte: Int
    durations_nin: [Int]
    createdAt_lt: DateTime
    riskCover_nin: [String]
    loanInsurance_lte: Int
    loanInsurance_gte: Int
    _id_ne: ObjectId
    loanInsurance: Int
    createdAt_gte: DateTime
    requiredGuarantors_exists: Boolean
    _id_lte: ObjectId
    disbursement_in: [String]
    createdAt_exists: Boolean
    gracePeriod_in: [Int]
    status_lte: String
    createdAt_nin: [DateTime]
    advanceInstallments_in: [LoanProductAdvanceInstallmentQueryInput]
    riskCover_gte: String
    createdAt: DateTime
    serviceCharge_nin: [LoanProductServiceChargeQueryInput]
  }

  input LoanProductRequiredDocumentFurtherLoanQueryInput {
    name_in: [String]
    _id_ne: ObjectId
    OR: [LoanProductRequiredDocumentFurtherLoanQueryInput!]
    _id_exists: Boolean
    name_nin: [String]
    _id: ObjectId
    name_gte: String
    name_exists: Boolean
    name_gt: String
    _id_gte: ObjectId
    _id_lte: ObjectId
    _id_nin: [ObjectId]
    _id_gt: ObjectId
    name: String
    _id_lt: ObjectId
    AND: [LoanProductRequiredDocumentFurtherLoanQueryInput!]
    _id_in: [ObjectId]
    name_ne: String
    name_lte: String
    name_lt: String
  }

  input LoanProductRequiredDocumentInitialLoanQueryInput {
    name_ne: String
    _id_ne: ObjectId
    _id_lt: ObjectId
    _id_exists: Boolean
    _id_gte: ObjectId
    _id_lte: ObjectId
    _id: ObjectId
    name_in: [String]
    name_lt: String
    name_exists: Boolean
    name_gt: String
    OR: [LoanProductRequiredDocumentInitialLoanQueryInput!]
    _id_gt: ObjectId
    name_gte: String
    AND: [LoanProductRequiredDocumentInitialLoanQueryInput!]
    _id_nin: [ObjectId]
    name_nin: [String]
    name_lte: String
    name: String
    _id_in: [ObjectId]
  }

  input LoanProductRequiredDocumentQueryInput {
    initialLoan_in: [LoanProductRequiredDocumentInitialLoanQueryInput]
    initialLoan_exists: Boolean
    initialLoan: [LoanProductRequiredDocumentInitialLoanQueryInput]
    initialLoan_nin: [LoanProductRequiredDocumentInitialLoanQueryInput]
    AND: [LoanProductRequiredDocumentQueryInput!]
    OR: [LoanProductRequiredDocumentQueryInput!]
    furtherLoans: [LoanProductRequiredDocumentFurtherLoanQueryInput]
    furtherLoans_exists: Boolean
    furtherLoans_in: [LoanProductRequiredDocumentFurtherLoanQueryInput]
    furtherLoans_nin: [LoanProductRequiredDocumentFurtherLoanQueryInput]
  }

  input LoanProductRequiredGuarantorQueryInput {
    group_lte: Int
    family_in: [Int]
    family_exists: Boolean
    group_gte: Int
    family_nin: [Int]
    group_lt: Int
    family_lte: Int
    family_gte: Int
    group_exists: Boolean
    AND: [LoanProductRequiredGuarantorQueryInput!]
    group_gt: Int
    family_lt: Int
    family_gt: Int
    group_nin: [Int]
    OR: [LoanProductRequiredGuarantorQueryInput!]
    group_ne: Int
    group: Int
    group_in: [Int]
    family: Int
    family_ne: Int
  }
  input LoanProductServiceChargeQueryInput {
    duration: Int
    charge_exists: Boolean
    duration_gt: Int
    charge_gt: Int
    charge_gte: Int
    duration_exists: Boolean
    charge_ne: Int
    duration_lt: Int
    duration_in: [Int]
    duration_lte: Int
    AND: [LoanProductServiceChargeQueryInput!]
    duration_gte: Int
    charge_nin: [Int]
    charge_lte: Int
    duration_ne: Int
    charge: Int
    OR: [LoanProductServiceChargeQueryInput!]
    charge_lt: Int
    duration_nin: [Int]
    charge_in: [Int]
  }

  input LoanQueryInput {
    loanOfficerId: UserQueryInput
    loanInsurance_exists: Boolean
    applicationAt_lt: DateTime
    branchId: BranchQueryInput
    clientGroupName_in: [String]
    code_exists: Boolean
    branchName_exists: Boolean
    clientGroupName_nin: [String]
    managerDecisionAt_in: [DateTime]
    feedbackId_exists: Boolean
    branchManagerId_gte: ObjectId
    _id_nin: [ObjectId]
    createdAt_lt: DateTime
    cycle: Int
    approvedAmount: Int
    disbursementAt_exists: Boolean
    branchName: String
    loanProductName_gte: String
    loanOfficerName_lt: String
    requestedAmount_lte: Int
    clientId: ClientQueryInput
    loanProductId_exists: Boolean
    applicationAt_in: [DateTime]
    installments: [LoanInstallmentQueryInput]
    _id_gt: ObjectId
    clientGroupName: String
    code_lt: String
    clientGroupName_ne: String
    disbursementAt_gte: DateTime
    loanInsurance_lt: Int
    status_lt: String
    branchManagerName_in: [String]
    loanInsurance_gt: Int
    applicationAt_nin: [DateTime]
    status: String
    clientGroupName_exists: Boolean
    clientGroupName_gt: String
    loanOfficerName_exists: Boolean
    requestedAmount_lt: Int
    disbursementAt_ne: DateTime
    status_gte: String
    loanOfficerName_in: [String]
    cashCollateral_lte: Decimal
    edited: Boolean
    disbursementPhoto: LoanDisbursementPhotoQueryInput
    approvedAmount_lt: Int
    branchName_lt: String
    interestRate_nin: [Int]
    cycle_lte: Int
    branchManagerId_in: [ObjectId]
    branchManagerId_nin: [ObjectId]
    clientGroupName_lte: String
    requestedAmount: Int
    managerDecisionAt_gt: DateTime
    loanProductName_gt: String
    cycle_gt: Int
    loanInsurance_in: [Int]
    loanInsurance: Int
    createdAt_nin: [DateTime]
    updatedAt_ne: DateTime
    branchManagerId_gt: ObjectId
    branchManagerId_ne: ObjectId
    branchName_lte: String
    createdAt_exists: Boolean
    applicationAt_gt: DateTime
    loanInsurance_gte: Int
    disbursementPhoto_exists: Boolean
    createdAt_gte: DateTime
    loanProductName: String
    interestRate_lt: Int
    signatures: LoanSignatureQueryInput
    edited_ne: Boolean
    requestedAmount_in: [Int]
    _id_ne: ObjectId
    disbursementAt_lt: DateTime
    duration_lt: Int
    branchManagerName_ne: String
    status_in: [String]
    branchManagerName_lt: String
    AND: [LoanQueryInput!]
    installments_nin: [LoanInstallmentQueryInput]
    managerDecisionAt: DateTime
    cashCollateral_ne: Decimal
    updatedAt_gte: DateTime
    approvedAmount_ne: Int
    branchManagerId_exists: Boolean
    loanProductName_in: [String]
    loanProductName_lte: String
    _id: ObjectId
    branchManagerId_lte: ObjectId
    branchManagerName_nin: [String]
    createdAt_in: [DateTime]
    feedbackId: FeedbackQueryInput
    loanProcessingFee_exists: Boolean
    branchManagerName_gt: String
    duration_gte: Int
    interestRate_ne: Int
    applicationAt_lte: DateTime
    branchName_gt: String
    loanProductName_ne: String
    cashCollateral_gt: Decimal
    code_gte: String
    interestRate_exists: Boolean
    interestRate_gte: Int
    requestedAmount_nin: [Int]
    approvedAmount_gt: Int
    cashCollateral_nin: [Decimal]
    duration: Int
    code_ne: String
    duration_ne: Int
    cashCollateral: Decimal
    duration_exists: Boolean
    applicationAt_gte: DateTime
    cycle_lt: Int
    clientId_exists: Boolean
    requestedAmount_gt: Int
    loanInsurance_ne: Int
    branchName_nin: [String]
    branchName_ne: String
    _id_in: [ObjectId]
    duration_lte: Int
    loanProductName_nin: [String]
    installments_in: [LoanInstallmentQueryInput]
    _id_gte: ObjectId
    loanInsurance_nin: [Int]
    code_in: [String]
    branchManagerName_exists: Boolean
    managerDecisionAt_nin: [DateTime]
    branchId_exists: Boolean
    approvedAmount_in: [Int]
    loanOfficerName_gt: String
    applicationAt: DateTime
    code_gt: String
    interestRate_gt: Int
    loanProductName_lt: String
    duration_in: [Int]
    branchName_in: [String]
    requestedAmount_exists: Boolean
    branchName_gte: String
    managerDecisionAt_lt: DateTime
    cycle_nin: [Int]
    branchManagerName_gte: String
    loanProductId: LoanProductQueryInput
    clientGroupId: ClientGroupQueryInput
    cycle_exists: Boolean
    duration_gt: Int
    loanProcessingFee: LoanLoanProcessingFeeQueryInput
    installments_exists: Boolean
    status_lte: String
    disbursementAt_in: [DateTime]
    managerDecisionAt_gte: DateTime
    branchManagerName_lte: String
    status_nin: [String]
    status_exists: Boolean
    applicationAt_exists: Boolean
    createdAt_gt: DateTime
    branchManagerId: ObjectId
    forms_exists: Boolean
    cashCollateral_in: [Decimal]
    createdAt_lte: DateTime
    interestRate: Int
    managerDecisionAt_lte: DateTime
    approvedAmount_lte: Int
    approvedAmount_nin: [Int]
    disbursementAt_nin: [DateTime]
    disbursementAt_lte: DateTime
    managerDecisionAt_ne: DateTime
    disbursementAt: DateTime
    code_nin: [String]
    cashCollateral_gte: Decimal
    _id_lt: ObjectId
    cycle_in: [Int]
    forms: LoanFormQueryInput
    cycle_ne: Int
    _id_exists: Boolean
    loanOfficerName_nin: [String]
    branchManagerName: String
    code: String
    loanOfficerName_ne: String
    updatedAt_in: [DateTime]
    updatedAt_nin: [DateTime]
    managerDecisionAt_exists: Boolean
    cashCollateral_exists: Boolean
    updatedAt: DateTime
    updatedAt_lte: DateTime
    status_ne: String
    loanOfficerName_gte: String
    interestRate_in: [Int]
    loanProductName_exists: Boolean
    status_gt: String
    updatedAt_exists: Boolean
    applicationAt_ne: DateTime
    interestRate_lte: Int
    disbursementAt_gt: DateTime
    updatedAt_lt: DateTime
    _id_lte: ObjectId
    cycle_gte: Int
    OR: [LoanQueryInput!]
    duration_nin: [Int]
    clientGroupId_exists: Boolean
    createdAt: DateTime
    cashCollateral_lt: Decimal
    loanOfficerName_lte: String
    loanInsurance_lte: Int
    updatedAt_gt: DateTime
    clientGroupName_lt: String
    code_lte: String
    branchManagerId_lt: ObjectId
    requestedAmount_gte: Int
    approvedAmount_exists: Boolean
    clientGroupName_gte: String
    signatures_exists: Boolean
    requestedAmount_ne: Int
    loanOfficerId_exists: Boolean
    approvedAmount_gte: Int
    edited_exists: Boolean
    loanOfficerName: String
    createdAt_ne: DateTime
  }

  input LoanProductQueryInput {
    _id: ObjectId
  }

  input LoanSignatureQueryInput {
    branchManager_lt: String
    loanOfficer_nin: [String]
    loanOfficer_ne: String
    loanOfficer_exists: Boolean
    loanOfficer_in: [String]
    AND: [LoanSignatureQueryInput!]
    client_exists: Boolean
    loanOfficer_lte: String
    client_lt: String
    loanOfficer_gte: String
    client_nin: [String]
    branchManager_ne: String
    client_gt: String
    branchManager_gt: String
    loanOfficer_gt: String
    branchManager_exists: Boolean
    witnesses: [LoanSignatureWitnessQueryInput]
    witnesses_nin: [LoanSignatureWitnessQueryInput]
    branchManager: String
    OR: [LoanSignatureQueryInput!]
    client_ne: String
    witnesses_in: [LoanSignatureWitnessQueryInput]
    branchManager_in: [String]
    client_in: [String]
    branchManager_gte: String
    loanOfficer: String
    branchManager_nin: [String]
    client_gte: String
    loanOfficer_lt: String
    client: String
    branchManager_lte: String
    client_lte: String
    witnesses_exists: Boolean
  }

  input LoanSignatureWitnessQueryInput {
    AND: [LoanSignatureWitnessQueryInput!]
    name_gt: String
    name_gte: String
    signature_gte: String
    signature_gt: String
    name_in: [String]
    signature_in: [String]
    name_lte: String
    name_lt: String
    OR: [LoanSignatureWitnessQueryInput!]
    name_nin: [String]
    signature_exists: Boolean
    name_ne: String
    signature_lte: String
    signature: String
    signature_lt: String
    signature_nin: [String]
    name_exists: Boolean
    name: String
    signature_ne: String
  }

  input OpenCashAtHandReportInput {
    unlockReason: String
    branchId: String
    date: String
  }

  input MoveClientToAnotherClientGroupInput {
    clientId: String
    clientGroupId: String
  }

  input SettingQueryInput {
    updatedAt_gte: DateTime
    name_exists: Boolean
    name_nin: [String]
    updatedAt_lt: DateTime
    _id_ne: ObjectId
    value_in: [String]
    createdAt_lt: DateTime
    createdAt_lte: DateTime
    name: String
    name_lt: String
    _id_nin: [ObjectId]
    value_lt: String
    name_gt: String
    updatedAt_gt: DateTime
    value_gt: String
    updatedAt_in: [DateTime]
    name_gte: String
    AND: [SettingQueryInput!]
    createdAt_ne: DateTime
    _id_in: [ObjectId]
    updatedAt_ne: DateTime
    createdAt_in: [DateTime]
    updatedAt_lte: DateTime
    _id_exists: Boolean
    value_lte: String
    updatedAt_nin: [DateTime]
    _id_gte: ObjectId
    name_ne: String
    updatedAt: DateTime
    createdAt: DateTime
    value_ne: String
    value_gte: String
    _id_lt: ObjectId
    name_lte: String
    createdAt_gt: DateTime
    _id_gt: ObjectId
    updatedAt_exists: Boolean
    createdAt_gte: DateTime
    value_exists: Boolean
    OR: [SettingQueryInput!]
    _id_lte: ObjectId
    name_in: [String]
    createdAt_nin: [DateTime]
    value: String
    _id: ObjectId
    createdAt_exists: Boolean
    value_nin: [String]
  }

  input UpdateLoanInput {
    firstInstallmentCollection: String
    installment: Int
    _id: String
    duration: Int
    interest: Int
    cashAtHand: String
    disbursement: String
    outstanding: Int
    principal: Int
    cycle: Int
    meta: String
  }

  input UserQueryInput {
    _id_nin: [ObjectId]
    realmUserId_in: [String]
    role_ne: String
    lastName_lt: String
    realmUserId_gte: String
    firstName_gt: String
    _id_gte: ObjectId
    branchId_nin: [ObjectId]
    role_gte: String
    fullPhoneNumber_lt: String
    firstName_exists: Boolean
    firstName_lt: String
    _id_in: [ObjectId]
    fullPhoneNumber_gt: String
    lastName_ne: String
    branchId: ObjectId
    _id_gt: ObjectId
    role_in: [String]
    realmUserId_nin: [String]
    _id_lt: ObjectId
    lastName_lte: String
    name_gt: String
    firstName_lte: String
    name_lt: String
    realmUserId_exists: Boolean
    _id_ne: ObjectId
    lastName_nin: [String]
    realmUserId_ne: String
    fullPhoneNumber_nin: [String]
    firstName_gte: String
    fullPhoneNumber_ne: String
    realmUserId: String
    branchId_lt: ObjectId
    branchId_lte: ObjectId
    branchId_ne: ObjectId
    branchId_in: [ObjectId]
    name_in: [String]
    firstName: String
    firstName_nin: [String]
    firstName_in: [String]
    role_lt: String
    fullPhoneNumber: String
    fullPhoneNumber_in: [String]
    name: String
    OR: [UserQueryInput!]
    role_lte: String
    name_ne: String
    firstName_ne: String
    fullPhoneNumber_exists: Boolean
    lastName_gt: String
    fullPhoneNumber_lte: String
    branchId_gte: ObjectId
    branchId_exists: Boolean
    branchId_gt: ObjectId
    role_nin: [String]
    _id: ObjectId
    lastName_gte: String
    realmUserId_gt: String
    name_lte: String
    name_nin: [String]
    name_gte: String
    lastName: String
    realmUserId_lte: String
    role: String
    lastName_in: [String]
    name_exists: Boolean
    realmUserId_lt: String
    fullPhoneNumber_gte: String
    role_exists: Boolean
    _id_exists: Boolean
    lastName_exists: Boolean
    AND: [UserQueryInput!]
    role_gt: String
    _id_lte: ObjectId
  }

  input ChangePasswordInput {
    passwordCurrent: String!
    passwordNew: String!
  }

  scalar DateTime

  scalar Decimal

  scalar ObjectId

  type Amortization {
    installments: [AmortizationInstallment]
  }

  type AmortizationInstallment {
    _id: ObjectId
    cumulativeInsurance: Int
    cumulativeInterest: Int
    due: String
    insurance: Int
    insuranceLiability: Int
    insuranceRealization: Int
    interest: Int
    interestReceivable: Int
    interestUnearned: Int
    monthlyAccruedInsurance: Int
    monthlyAccruedInsuranceRealization: Int
    monthlyAccruedInterest: Int
    monthlyAccruedInterestRealization: Int
    principalOutstandingClosingBalance: Int
    principalOutstandingOpeningBalance: Int
    principalRepayment: Int
    realInsurance: Int
    realization: Int
    status: String
    target: Int
    total: Int
    wasLate: Boolean
  }

  type Branch {
    _id: ObjectId
    address: BranchAddress
    code: String
    createdAt: DateTime
    initDate: DateTime
    initOpeningBalance: Int
    name: String
    others: BranchOther
    status: String
    updatedAt: DateTime
  }

  type BranchAddress {
    area: String
    county: String
    district: String
    street: String
    subcounty: String
  }

  type BranchOther {
    majorCompetitors: String
    outreach: String
    servicingBanks: String
  }

  type CanCloseCashAtHandReport {
    canClose: Boolean
    lastOpenDate: String
  }

  type CashAtHandForm {
    _id: ObjectId
    branchId: ObjectId
    closed: Boolean
    closingBalance: Int
    createdAt: DateTime
    date: String
    dateIso: DateTime
    openingBalance: Int
    payments: CashAtHandFormPayment
    receipts: CashAtHandFormReceipt
    updatedAt: DateTime
  }

  type CashAtHandReport {
    url: String
  }

  type CashAtHandFormPayment {
    bankDeposit: Int
    bankDepositNotes: String
    expenses: CashAtHandFormPaymentExpense
    loanDisbursements: Int
    securityWithdrawals: Int
    securityReturn: Int
    securityReturnNotes: String
    toHeadOffice: Int
    toHeadOfficeNotes: String
    toOtherBranches: Int
    toOtherBranchesNotes: String
  }

  type CashAtHandFormPaymentExpense {
    insuranceClaim: Int
    insuranceClaimNotes: String
    internet: Int
    internetNotes: String
    miscellaneous: Int
    miscellaneousNotes: String
    officeManagement: Int
    officeManagementNotes: String
    rent: Int
    rentNotes: String
    rubbishCollection: Int
    rubbishCollectionNotes: String
    staffAirtime: Int
    staffAirtimeNotes: String
    staffLunch: Int
    staffLunchNotes: String
    staffTransport: Int
    staffTransportNotes: String
    utilities: Int
    utilitiesNotes: String
  }

  type CashAtHandFormReceipt {
    bankWithdrawal: Int
    bankWithdrawalNotes: String
    fromHeadOffice: Int
    fromHeadOfficeNotes: String
    fromOtherBranches: Int
    fromOtherBranchesNotes: String
    loanRelatedFundsReceived: Int
    otherIncome: Int
    otherIncomeNotes: String
    admissionFees: Int
    otherAdmissionFeesNotes: String
    passbookFees: Int
    passbookFeesNotes: String
    loanProcessingFees: Int
    otherLoanProcessingFeesNotes: String
    loanInsurance: Int
    otherLoanInsuranceNotes: String
  }

  type Client {
    _id: ObjectId
    addedAt: DateTime
    admission: ClientAdmission
    admissionAt: DateTime
    clientGroupId: ClientGroup
    code: String
    createdAt: DateTime
    firstName: String
    lastEventId: ObjectId
    lastName: String
    lastRenewalAt: DateTime
    loans: [ObjectId]
    passbook: Boolean
    photo: String
    role: String
    securityBalance: Int
    status: String
    updatedAt: DateTime
  }

  type ClientAdmission {
    address: String
    notes: String
    smallBusinessLoan: Boolean
  }

  type ClientGroup {
    _id: ObjectId
    branchId: Branch
    cashierId: Client
    code: String
    createdAt: DateTime
    loanOfficerId: User
    loansOutstanding: Int
    meeting: ClientGroupMeeting
    name: String
    presidentId: Client
    securityBalance: Int
    secretaryId: Client
    status: String
    updatedAt: DateTime
    wasRejected: Boolean
  }

  type ClientGroupMeeting {
    address: String
    dayOfWeek: Int
    frequency: String
    lat: String
    lng: String
    startedAt: DateTime
    time: String
  }

  type ClientGroupsMeeting {
    _id: ObjectId
    attendance: [ClientGroupsMeetingAttendance]
    clientGroupId: ClientGroup
    createdAt: DateTime
    endedAt: DateTime
    installments: [ClientGroupsMeetingInstallment]
    loanOfficer: ClientGroupsMeetingLoanOfficer
    notes: String
    photo: String
    photoUrl: String
    place: String
    potentialClientsVerified: Boolean
    requests: String
    scheduledAt: DateTime
    startedAt: DateTime
    updatedAt: DateTime
  }

  type ClientGroupsMeetingAttendance {
    attended: Boolean
    clientId: ObjectId
    firstName: String
    lastName: String
    representative: Boolean
  }

  type ClientGroupsMeetingInstallment {
    _id: ObjectId
    approvedAmount: Int
    clientId: ObjectId
    clientName: String
    cumulativeRealization: Int
    due: DateTime
    durationValue: Int
    durationUnit: String
    installment: Int
    loanId: ObjectId
    openingBalance: Int
    overdue: Int
    overdueInstallments: Int
    realization: Int
    status: String
    target: Int
    todaysRealization: Int
    total: Int
  }

  type ClientGroupsMeetingLoanOfficer {
    firstName: String
    lastName: String
  }

  type ClientsInspectionForm {
    client: ClientsInspectionFormClient
    form: ClientsInspectionFormForm
    group: ClientsInspectionFormGroup
  }

  type ClientsInspectionFormClient {
    _id: String
    address: String
    firstName: String
    lastName: String
  }

  type ClientsInspectionFormForm {
    _id: String
  }

  type ClientsInspectionFormGroup {
    _id: String
    address: String
    dayOfWeek: Int
    frequency: String
    startedAt: DateTime
    name: String
  }

  type ClientsInspectionItem {
    _id: String
    address: String
    dayOfWeek: Int
    frequency: String
    startedAt: DateTime
    forms: [ClientsInspectionForm]
    name: String
  }

  type DefaultPayload {
    status: String!
  }

  type Event {
    _id: ObjectId
    importId: ObjectId
    importNotes: String
    importedAt: DateTime
    meta: String
    migration: String
    obj: String
    objId: ObjectId
    payload: EventPayload
    timestamp: DateTime
    type: String
    userId: ObjectId
  }

  type EventPayloadDuration {
    value: Int
    unit: String
  }

  type EventPayload {
    addedAt: DateTime
    address: EventPayloadAddress
    admission: EventPayloadAdmission
    admissionAt: DateTime
    advanceInstallments: [EventPayloadAdvanceInstallment]
    answer: String
    applicationAt: DateTime
    approvedAmount: Int
    attendance: [EventPayloadAttendance]
    branchId: ObjectId
    branchManagerId: ObjectId
    branchManagerName: String
    branchName: String
    cashCollateral: Int
    cashierId: ObjectId
    clientGroupId: ObjectId
    clientGroupName: String
    clientId: ObjectId
    clientsActive: Int
    clientsRegistered: Int
    closed: Boolean
    closingBalance: Int
    code: String
    comment: String
    content: EventPayloadContent
    cycle: Int
    date: String
    dateIso: DateTime
    decidedAt: DateTime
    disbursement: String
    disbursementAt: DateTime
    disbursementPhoto: EventPayloadDisbursementPhoto
    duration: EventPayloadDuration
    durations: [LoanProductDuration]
    edited: Boolean
    endAt: DateTime
    endedAt: DateTime
    feedbackId: ObjectId
    firstLoanDisbursement: Int
    firstName: String
    formType: String
    forms: EventPayloadForm
    fullPhoneNumber: String
    gracePeriod: Int
    id: ObjectId
    initDate: DateTime
    initOpeningBalance: Int
    initialLoan: [EventPayloadInitialLoan]
    installments: [EventPayloadInstallment]
    interestRate: Int
    invitedAt: DateTime
    joinedAt: DateTime
    label: String
    lastName: String
    lastRenewalAt: DateTime
    limits: [EventPayloadLimit]
    loanGracePeriod: Int
    loanId: ObjectId
    loanIncrementEachCycle: [EventPayloadLoanIncrementEachCycle]
    loanInsurance: Int
    loanOfficerId: ObjectId
    loanOfficerName: String
    loanOutstanding: Int
    loanProcessingFee: EventPayloadLoanProcessingFee
    loanProduct: ObjectId
    loanProductId: ObjectId
    loanProductName: String
    locations: EventPayloadLocation
    managerDecisionAt: DateTime
    meeting: EventPayloadMeeting
    name: String
    notes: String
    openingBalance: Int
    others: EventPayloadOther
    passbook: Boolean
    passbookIdentifier: String
    payments: EventPayloadPayment
    phoneNumber: String
    photo: String
    photoUrl: String
    potentialClientsVerified: Boolean
    presidentId: ObjectId
    previousEndAt: DateTime
    previousStartAt: DateTime
    previousYearly: Boolean
    question: String
    receipts: EventPayloadReceipt
    relatedFormId: ObjectId
    requestedAmount: Int
    requests: String
    requiredDocuments: EventPayloadRequiredDocument
    requiredGuarantors: EventPayloadRequiredGuarantor
    riskCover: String
    role: String
    savingsBalance: Int
    scheduledAt: DateTime
    secretaryId: ObjectId
    serviceCharge: [EventPayloadServiceCharge]
    signatures: EventPayloadSignature
    startAt: DateTime
    startedAt: DateTime
    status: String
    submittedAt: DateTime
    type: String
    unlockReason: String
    value: String
    wasRejected: Boolean
    yearly: Boolean
  }

  type EventPayloadAddress {
    area: String
    county: String
    district: String
    street: String
    subcounty: String
  }

  type EventPayloadAdmission {
    address: String
    notes: String
    smallBusinessLoan: Boolean
  }

  type EventPayloadAdvanceInstallment {
    duration: Int
    installments: Int
  }

  type EventPayloadAttendance {
    attended: Boolean
    clientId: ObjectId
    firstName: String
    lastName: String
    representative: Boolean
  }

  type EventPayloadContent {
    dateOfBirth: DateTime
    debt: EventPayloadContentDebt
    fatherOrHusbandName: String
    forecast: EventPayloadContentForecast
    guarantors: [EventPayloadContentGuarantor]
    inspection: [EventPayloadContentInspection]
    loan: EventPayloadContentLoan
    loanRequirements: [EventPayloadContentLoanRequirement]
    maritalStatus: String
    mobilePhoneNumber: String
    nationalVoterIdNumber: String
    nationalVoterIdPhoto: EventPayloadContentNationalVoterIdPhoto
    occupation: String
    partnersConsent: Boolean
    photo: EventPayloadContentPhoto
    previousLoan: EventPayloadContentPreviousLoan
    projects: [String]
    residence: EventPayloadContentResidence
    sex: String
    utilization: EventPayloadContentUtilization
    work: EventPayloadContentWork
  }

  type EventPayloadContentDebt {
    amount: Int
    source: String
  }

  type EventPayloadContentForecast {
    core: EventPayloadContentForecastCore
    other: EventPayloadContentForecastOther
  }

  type EventPayloadContentForecastCore {
    comment: String
    monthlyExpenditure: Int
    monthlyIncome: Int
  }

  type EventPayloadContentForecastOther {
    comment: String
    monthlyExpenditure: Int
    monthlyIncome: Int
  }

  type EventPayloadContentGuarantor {
    name: String
    nationalVoterIdNumber: String
    nationalVoterIdPhoto: EventPayloadContentGuarantorNationalVoterIdPhoto
    photo: EventPayloadContentGuarantorPhoto
    relation: String
    signature: String
  }

  type EventPayloadContentGuarantorNationalVoterIdPhoto {
    lat: String
    lng: String
    uri: String
  }

  type EventPayloadContentGuarantorPhoto {
    lat: String
    lng: String
    uri: String
  }

  type EventPayloadContentInspection {
    lat: String
    lng: String
    uri: String
  }

  type EventPayloadContentLoan {
    amount: Int
    cashCollateral: Int
    cycle: Int
    duration: Int
    interestRate: Int
    name: String
    type: ObjectId
  }

  type EventPayloadContentLoanRequirement {
    lat: String
    lng: String
    name: String
    requirement: ObjectId
    uri: String
  }

  type EventPayloadContentNationalVoterIdPhoto {
    lat: String
    lng: String
    uri: String
  }

  type EventPayloadContentPhoto {
    lat: String
    lng: String
    uri: String
  }

  type EventPayloadContentPreviousLoan {
    amount: Int
    cycle: String
    purpose: String
  }

  type EventPayloadContentResidence {
    area: String
    county: String
    district: String
    notes: String
    subcounty: String
  }

  type EventPayloadContentUtilization {
    debtPayment: EventPayloadContentUtilizationDebtPayment
    equipment: EventPayloadContentUtilizationEquipment
    extension: EventPayloadContentUtilizationExtension
    other: EventPayloadContentUtilizationOther
    rent: EventPayloadContentUtilizationRent
    workingCapital: EventPayloadContentUtilizationWorkingCapital
  }

  type EventPayloadContentUtilizationDebtPayment {
    cost: Int
    security: String
    value: Int
  }

  type EventPayloadContentUtilizationEquipment {
    cost: Int
    security: String
    value: Int
  }

  type EventPayloadContentUtilizationExtension {
    cost: Int
    security: String
    value: Int
  }

  type EventPayloadContentUtilizationOther {
    cost: Int
    security: String
    value: Int
  }

  type EventPayloadContentUtilizationRent {
    cost: Int
    security: String
    value: Int
  }

  type EventPayloadContentUtilizationWorkingCapital {
    cost: Int
    security: String
    value: Int
  }

  type EventPayloadContentWork {
    area: String
    county: String
    district: String
    notes: String
    subcounty: String
  }

  type EventPayloadDisbursementPhoto {
    lat: String
    lng: String
    uri: String
  }

  type EventPayloadForm {
    application: ObjectId
    inspection: ObjectId
  }

  type EventPayloadInitialLoan {
    duration: Int
    from: Int
    to: Int
  }

  type EventPayloadInstallment {
    _id: ObjectId
    approvedAmount: Int
    clientId: ObjectId
    cumulativeRealization: Int
    due: DateTime
    installment: Int
    interest: Int
    loanId: ObjectId
    openingBalance: Int
    overdue: Int
    overdueInstallments: Int
    principalOutstandingClosingBalance: Int
    principalOutstandingOpeningBalance: Int
    principalRepayment: Int
    realization: Int
    status: String
    target: Int
    todaysRealization: Int
    total: Int
    wasLate: Boolean
  }

  type EventPayloadLimit {
    duration: Int
    limit: Int
  }

  type EventPayloadLoanIncrementEachCycle {
    duration: Int
    from: Int
    to: Int
  }

  type EventPayloadLoanProcessingFee {
    type: String
    value: Int
  }

  type EventPayloadLocation {
    decision: EventPayloadLocationDecision
    start: EventPayloadLocationStart
    submission: EventPayloadLocationSubmission
  }

  type EventPayloadLocationDecision {
    lat: String
    lng: String
  }

  type EventPayloadLocationStart {
    lat: String
    lng: String
  }

  type EventPayloadLocationSubmission {
    lat: String
    lng: String
  }

  type EventPayloadMeeting {
    address: String
    dayOfWeek: Int
    frequency: String
    lat: String
    lng: String
    startedAt: DateTime
    time: String
  }

  type EventPayloadOther {
    majorCompetitors: String
    outreach: String
    servicingBanks: String
  }

  type EventPayloadPayment {
    bankDeposit: Int
    bankDepositNotes: String
    expenses: EventPayloadPaymentExpense
    loanDisbursements: Int
    securityWithdrawals: Int
    securityReturn: Int
    securityReturnNotes: String
    toHeadOffice: Int
    toHeadOfficeNotes: String
    toOtherBranches: Int
    toOtherBranchesNotes: String
  }

  type EventPayloadPaymentExpense {
    insuranceClaim: Int
    insuranceClaimNotes: String
    internet: Int
    internetNotes: String
    miscellaneous: Int
    miscellaneousNotes: String
    officeManagement: Int
    officeManagementNotes: String
    rent: Int
    rentNotes: String
    rubbishCollection: Int
    rubbishCollectionNotes: String
    staffAirtime: Int
    staffAirtimeNotes: String
    staffLunch: Int
    staffLunchNotes: String
    staffTransport: Int
    staffTransportNotes: String
    utilities: Int
    utilitiesNotes: String
  }

  type EventPayloadReceipt {
    bankWithdrawal: Int
    bankWithdrawalNotes: String
    fromHeadOffice: Int
    fromHeadOfficeNotes: String
    fromOtherBranches: Int
    fromOtherBranchesNotes: String
    loanRelatedFundsReceived: Int
    otherIncome: Int
    otherIncomeNotes: String
  }

  type EventPayloadRequiredDocument {
    furtherLoans: [EventPayloadRequiredDocumentFurtherLoan]
    initialLoan: [EventPayloadRequiredDocumentInitialLoan]
  }

  type EventPayloadRequiredDocumentInitialLoan {
    _id: ObjectId
    name: String
  }

  type EventPayloadRequiredDocumentFurtherLoan {
    _id: ObjectId
    name: String
  }

  type EventPayloadRequiredGuarantor {
    family: Int
    group: Int
  }

  type EventPayloadServiceCharge {
    charge: Int
    duration: Int
  }

  type EventPayloadSignature {
    branchManager: String
    client: String
    employee: String
    loanOfficer: String
    witnesses: [EventPayloadSignatureWitness]
  }

  type EventPayloadSignatureWitness {
    name: String
    signature: String
  }

  type Feedback {
    _id: ObjectId
    answer: String
    branchId: Branch
    clientId: Client
    comment: String
    createdAt: DateTime
    label: String
    loanId: Loan
    loanOfficerId: User
    question: String
    updatedAt: DateTime
  }

  type Form {
    _id: ObjectId
    clientId: Client
    code: String
    content: FormContent
    createdAt: DateTime
    feedbackId: Feedback
    lastEventId: ObjectId
    loanId: Loan
    locations: FormLocation
    notes: String
    relatedFormId: ObjectId
    signatures: FormSignature
    status: String
    type: String
    formType: String
    updatedAt: DateTime
    userId: User
  }

  type FormContent {
    dateOfBirth: DateTime
    debt: FormContentDebt
    fatherOrHusbandName: String
    forecast: FormContentForecast
    guarantors: [FormContentGuarantor]
    inspection: [FormContentInspection]
    loan: FormContentLoan
    loanId: ObjectId
    loanRequirements: [FormContentLoanRequirement]
    maritalStatus: String
    mobilePhoneNumber: String
    nationalVoterIdNumber: String
    nationalVoterIdPhoto: FormContentNationalVoterIdPhoto
    occupation: String
    partnersConsent: Boolean
    photo: FormContentPhoto
    previousLoan: FormContentPreviousLoan
    projects: [String]
    residence: FormContentResidence
    sex: String
    utilization: FormContentUtilization
    work: FormContentWork
  }

  type FormContentDebt {
    amount: Int
    source: String
  }

  type FormContentForecast {
    core: FormContentForecastCore
    other: FormContentForecastOther
  }

  type FormContentForecastCore {
    comment: String
    monthlyExpenditure: Int
    monthlyIncome: Int
  }

  type FormContentForecastOther {
    comment: String
    monthlyExpenditure: Int
    monthlyIncome: Int
  }

  type FormContentGuarantor {
    name: String
    nationalVoterIdNumber: String
    nationalVoterIdPhoto: FormContentGuarantorNationalVoterIdPhoto
    photo: FormContentGuarantorPhoto
    relation: String
    signature: String
  }

  type FormContentGuarantorNationalVoterIdPhoto {
    lat: String
    lng: String
    uri: String
  }

  type FormContentGuarantorPhoto {
    lat: String
    lng: String
    uri: String
  }

  type FormContentInspection {
    lat: String
    lng: String
    uri: String
  }

  type FormContentLoan {
    amount: Int
    cashCollateral: Int
    cycle: Int
    duration: FormContentLoanDuration
    interestRate: Int
    name: String
    type: ObjectId
  }

  type FormContentLoanDuration {
    value: Int
    unit: String
  }

  type FormContentLoanRequirement {
    lat: String
    lng: String
    name: String
    requirement: ObjectId
    uri: String
  }

  type FormContentNationalVoterIdPhoto {
    lat: String
    lng: String
    uri: String
  }

  type FormContentPhoto {
    lat: String
    lng: String
    uri: String
  }

  type FormContentPreviousLoan {
    amount: Int
    cycle: String
    purpose: String
  }

  type FormContentResidence {
    area: String
    county: String
    district: String
    notes: String
    subcounty: String
  }

  type FormContentUtilization {
    debtPayment: FormContentUtilizationDebtPayment
    equipment: FormContentUtilizationEquipment
    extension: FormContentUtilizationExtension
    other: FormContentUtilizationOther
    rent: FormContentUtilizationRent
    workingCapital: FormContentUtilizationWorkingCapital
  }

  type FormContentUtilizationDebtPayment {
    cost: Int
    security: String
    value: Int
  }

  type FormContentUtilizationEquipment {
    cost: Int
    security: String
    value: Int
  }

  type FormContentUtilizationExtension {
    cost: Int
    security: String
    value: Int
  }

  type FormContentUtilizationOther {
    cost: Int
    security: String
    value: Int
  }

  type FormContentUtilizationRent {
    cost: Int
    security: String
    value: Int
  }

  type FormContentUtilizationWorkingCapital {
    cost: Int
    security: String
    value: Int
  }

  type FormContentWork {
    area: String
    county: String
    district: String
    notes: String
    subcounty: String
  }

  type FormLocation {
    start: FormLocationStart
    submission: FormLocationSubmission
  }

  type FormLocationStart {
    lat: String
    lng: String
  }

  type FormSignature {
    client: String
    employee: String
  }

  type FormLocationSubmission {
    lat: String
    lng: String
  }

  type Holiday {
    _id: ObjectId
    createdAt: DateTime
    endAt: DateTime
    name: String
    notes: String
    startAt: DateTime
    updatedAt: DateTime
    yearly: Boolean
  }

  type InitCashAtHandReport {
    loanDisbursements: Int
    loanRelatedFundsReceived: Int
    openingBalance: Int
    securityWithdrawals: Int
    admissionFees: Int
    passbookFees: Int
    loanInsurance: Int
    loanProcessingFees: Int
    todaysRealizations: Int
    securityPayments: Int
    meta: String
  }

  type Loan {
    _id: ObjectId
    applicationAt: DateTime
    approvedAmount: Int
    branchId: Branch
    branchManagerId: ObjectId
    branchManagerName: String
    branchName: String
    cashCollateral: Decimal
    clientGroupId: ClientGroup
    clientGroupName: String
    clientId: Client
    code: String
    createdAt: DateTime
    cycle: Int
    disbursementAt: DateTime
    disbursementPhoto: LoanDisbursementPhoto
    duration: LoanDuration
    edited: Boolean
    feedbackId: Feedback
    forms: LoanForm
    installments: [LoanInstallment]
    interestRate: Int
    loanInsurance: Int
    loanOfficerId: User
    loanOfficerName: String
    loanProcessingFee: LoanLoanProcessingFee
    loanProductId: LoanProduct
    loanProductName: String
    managerDecisionAt: DateTime
    requestedAmount: Int
    signatures: LoanSignature
    status: String
    updatedAt: DateTime
  }

  type LoanDuration {
    value: Int
    unit: String
  }

  type LoanDisbursementPhoto {
    lat: String
    lng: String
    uri: String
  }

  type LoanForm {
    application: Form
    inspection: Form
  }

  type LoanInstallment {
    _id: ObjectId
    due: DateTime
    interest: Int
    principalOutstandingClosingBalance: Int
    principalOutstandingOpeningBalance: Int
    principalRepayment: Int
    realization: Int
    status: String
    target: Int
    total: Int
    wasLate: Boolean
  }

  type LoanLoanProcessingFee {
    type: String
    value: Int
  }

  type LoanProductDuration {
    weekly: [Int]
    biweekly: [Int]
    monthly: [Int]
  }

  type LoanProductGracePeriod {
    durationValue: Int
    durationUnit: String
    gracePeriodDays: Int
  }

  type LoanProduct {
    _id: ObjectId
    advanceInstallments: [LoanProductAdvanceInstallment]
    cashCollateral: LoanProductCashCollateral
    createdAt: DateTime
    disbursement: String
    durations: LoanProductDuration
    firstLoanDisbursement: Int
    gracePeriods: [LoanProductGracePeriod]
    initialLoan: [LoanProductInitialLoan]
    limits: [LoanProductLimit]
    loanIncrementEachCycle: [LoanProductLoanIncrementEachCycle]
    loanInsurance: Int
    loanProcessingFee: LoanProductLoanProcessingFee
    name: String
    requiredDocuments: LoanProductRequiredDocument
    requiredGuarantors: LoanProductRequiredGuarantor
    riskCover: String
    serviceCharges: [LoanProductServiceCharge]
    status: String
    updatedAt: DateTime
    disbursementAllowCheques: Boolean
  }

  type LoanProductAdvanceInstallment {
    durationValue: Int
    durationUnit: String
    installments: Int
  }

  type LoanProductCashCollateral {
    furtherLoans: Decimal
    initialLoan: Decimal
  }

  type LoanProductInitialLoan {
    durationValue: Int
    durationUnit: String
    from: Int
    to: Int
  }

  type LoanProductLimit {
    durationValue: Int
    durationUnit: String
    limit: Int
  }

  type LoanProductLoanIncrementEachCycle {
    durationValue: Int
    durationUnit: String
    from: Int
    to: Int
  }

  type LoanProductLoanProcessingFee {
    type: String
    value: Int
  }

  type LoanProductRequiredDocument {
    furtherLoans: [LoanProductRequiredDocumentFurtherLoan]
    initialLoan: [LoanProductRequiredDocumentInitialLoan]
  }

  type LoanProductRequiredDocumentFurtherLoan {
    _id: ObjectId
    name: String
  }

  type LoanProductRequiredDocumentInitialLoan {
    _id: ObjectId
    name: String
  }

  type LoanProductRequiredGuarantor {
    family: Int
    group: Int
  }

  type LoanProductServiceCharge {
    charge: Int
    durationValue: Int
    durationUnit: String
  }

  type LoanReport {
    url: String
  }

  type LoanSignatureWitness {
    name: String
    signature: String
  }

  type LoanSignature {
    branchManager: String
    client: String
    loanOfficer: String
    witnesses: [LoanSignatureWitness]
  }

  type UploadUrl {
    signedUrl: String!
    filename: String!
    previewUrl: String!
  }

  type Mutation {
    addEvent(input: EventInsertInput!): Event
    collectInstallment(input: CollectInstallmentInput): Boolean
    collectInstallmentAsNonLoanOfficer(
      input: CollectInstallmentAsNonLoanOfficerInput
    ): DefaultPayload
    disburseLoan(input: DisburseLoanInput): DefaultPayload
    exportCashAtHandReport(input: ExportCashAtHandReportInput): CashAtHandReport
    exportLoanReport: LoanReport
    moveClientToAnotherClientGroup(
      input: MoveClientToAnotherClientGroupInput
    ): DefaultPayload
    openCashAtHandReport(input: OpenCashAtHandReportInput): DefaultPayload
    updateLoan(input: UpdateLoanInput): Boolean
    createUploadUrl(
      filename: String!
      filetype: String!
      type: String!
    ): UploadUrl
    withdrawSecurity(input: WithdrawSecurityInput): DefaultPayload
    changePassword(input: ChangePasswordInput!): DefaultPayload
  }

  type Notification {
    clientGroups: Boolean
    forms: Boolean
    loans: Boolean
  }

  type Query {
    amortization(input: String): Amortization
    branch(query: BranchQueryInput): Branch
    branches(
      query: BranchQueryInput
      limit: Int = 100
      sortBy: BranchSortByInput
    ): [Branch]!
    canCloseCashAtHandReport(
      input: CanCloseCashAtHandReportInput
    ): CanCloseCashAtHandReport
    cashAtHandForm(query: CashAtHandFormQueryInput): CashAtHandForm
    client(query: ClientQueryInput): Client
    clientGroup(query: ClientGroupQueryInput): ClientGroup
    clientGroupWithStats(input: String): ClientGroup
    clientGroups(
      query: ClientGroupQueryInput
      limit: Int = 1000
      sortBy: ClientGroupSortByInput
    ): [ClientGroup]!
    clientGroupsCount: Int
    clientGroupsMeeting(
      query: ClientGroupsMeetingQueryInput
    ): ClientGroupsMeeting
    clientGroupsMeetings(
      query: ClientGroupsMeetingQueryInput
      limit: Int = 100
      sortBy: ClientGroupsMeetingSortByInput
    ): [ClientGroupsMeeting]!
    clients(
      query: ClientQueryInput
      limit: Int = 1000
      sortBy: ClientSortByInput
    ): [Client]!
    clientsCount: Int
    clientsInspections: [ClientsInspectionItem]
    form(query: FormQueryInput): Form
    forms(
      limit: Int = 100
      sortBy: FormSortByInput
      query: FormQueryInput
    ): [Form]!
    formsCount: Int
    holiday(query: HolidayQueryInput): Holiday
    holidays(
      sortBy: HolidaySortByInput
      query: HolidayQueryInput
      limit: Int = 100
    ): [Holiday]!
    initCashAtHandReport(input: CashAtHandReportInputType): InitCashAtHandReport
    loan(query: LoanQueryInput): Loan
    loanProduct(query: LoanProductQueryInput): LoanProduct
    loanProducts(
      sortBy: LoanProductSortByInput
      query: LoanProductQueryInput
      limit: Int = 100
    ): [LoanProduct]!
    loans(
      query: LoanQueryInput
      limit: Int = 100
      sortBy: LoanSortByInput
    ): [Loan]!
    loansToDisburse(
      query: LoanQueryInput
      limit: Int = 100
      sortBy: LoanSortByInput
    ): [Loan]!
    loansCount: Int
    notifications(input: String): Notification
    settings(
      query: SettingQueryInput
      limit: Int = 100
      sortBy: SettingSortByInput
    ): [Setting]!
    todayClientGroups: [ClientGroup]
    todayMeeting(input: String): ClientGroupsMeeting
    todayRealizations: TodayRealization
    user(query: UserQueryInput): User
    users(query: UserQueryInput, limit: Int = 100): [User]!
    clientSummary(clientGroupId: ObjectId, date: String): [ClientSummary]
    clientGroupSummary(
      loanOfficerId: ObjectId
      date: String
    ): [ClientGroupSummary]
    loanOfficerSummary(branchId: ObjectId, date: String): [LoanOfficerSummary]
    branchOverview(branchId: ObjectId, date: String): BranchOverview
    bmCollectionsOverview(
      branchId: ObjectId
      loanOfficerId: ObjectId
      clientGroupId: ObjectId
      date: String
    ): [BmCollectionsOverview]
  }

  type SecurityBalance {
    _id: ObjectId
    client: Client
    change: Float
  }

  type BmCollectionsOverview {
    todaysRealizationCash: Float
    todaysRealizationSecurity: Float
    loanOfficerName: String
    clientGroupName: String
    clientName: String
    meetingScheduledDate: DateTime
  }

  type BranchOverview {
    newAdmissions: [Client]
    clientsWithPassbooksIssuedOrRenewed: [Client]
    newLoanApplications: [Loan]
    clientsWithSecurityAdjustments: [Client]
    disbursements: [Loan]
    securityBalances: [SecurityBalance]
  }

  type ClientSummary {
    loanOfficerName: String
    loanOfficerId: String
    clientGroupName: String
    clientGroupId: String
    clientName: String
    clientId: String
    realizable: Float
    realization: Float
    advance: Float
    odCollection: Float
    newOverdue: Float
  }

  type LoanOfficerSummary {
    loanOfficerName: String
    loanOfficerId: String
    realizable: Float
    realization: Float
    advance: Float
    odCollection: Float
    newOverdue: Float
  }

  type ClientGroupSummary {
    loanOfficerName: String
    loanOfficerId: String
    clientGroupName: String
    clientGroupId: String
    realizable: Float
    realization: Float
    advance: Float
    odCollection: Float
    newOverdue: Float
  }

  type Setting {
    _id: ObjectId
    createdAt: DateTime
    name: String
    updatedAt: DateTime
    value: String
  }

  type TodayRealization {
    clientGroupsMeetings: [TodayRealizationClientGroupsMeeting]
    total: TodayRealizationTotal
  }

  type TodayRealizationClientGroupsMeeting {
    installment: Int
    overdue: Int
    todaysRealization: Int
  }

  type TodayRealizationTotal {
    installment: Int
    overdue: Int
    todaysRealization: Int
  }
  input FormCollectionInput {
    _id: ObjectId
    branchId: ObjectId!
    firstName: String!
    fullPhoneNumber: String!
    lastName: String!
    role: String!
    password: String!
    timestamp: DateTime
  }
  type FormCollection {
    _id: ObjectId
    branchId: ObjectId!
    firstName: String!
    fullPhoneNumber: String!
    lastName: String!
    role: String!
    password: String!
    timestamp: DateTime
  }
  type Query {
    formCollections: [FormCollection]
    formCollection(id: ID!): FormCollection
  }
  type Mutation {
    createFormCollection(
      formCollectionInput: FormCollectionInput
    ): FormCollection
  }
  type User {
    _id: ObjectId
    branchId: ObjectId
    firstName: String
    fullPhoneNumber: String
    lastName: String
    name: String
    realmUserId: String
    role: String
    isDisabled: Boolean
  }
`

module.exports = typeDefs
