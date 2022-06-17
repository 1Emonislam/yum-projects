const loanReportService = require('../../services/loanReport')

const exportLoanReport = async (_, __, { mongodb, eventProcessor, user }) => {
  const url = await loanReportService(mongodb, user)

  await eventProcessor.addEvent({
    type: 'create',
    obj: 'report',
    payload: {
      type: 'loan',
      url,
    },
  })

  return { url }
}

module.exports = exportLoanReport
