const { ObjectId } = require('mongodb')

const canCloseCashAtHandReport = require('./legacy/canCloseCashAtHandReport')
const exportCashAtHandReport = require('./legacy/exportCashAtHandReport')
const initCashAtHandReport = require('./legacy/initCashAtHandReport')
const openCashAtHandReport = require('./legacy/openCashAtHandReport')

const resolvers = {
  canCloseCashAtHandReport,
  cashAtHandForm: async (_, { query: { branchId, date } }, { dataSources }) => {
    return dataSources.cashAtHandForms.collection.findOne({
      branchId: ObjectId(branchId),
      date,
    })
  },
  exportCashAtHandReport,
  initCashAtHandReport,
  openCashAtHandReport,
}

module.exports = resolvers
