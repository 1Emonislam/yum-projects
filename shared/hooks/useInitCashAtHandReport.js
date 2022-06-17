import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const initCashAtHandReport = async ({ branchId, date }) => {
  const { initCashAtHandReport } = await graphQLClient.request(
    gql`
      query initCashAtHandReport($branchId: String, $date: String) {
        initCashAtHandReport(input: { branchId: $branchId, date: $date }) {
          loanDisbursements
          loanRelatedFundsReceived
          openingBalance
          securityWithdrawals
          admissionFees
          passbookFees
          loanInsurance
          loanProcessingFees
          todaysRealizations
          securityPayments
          meta
        }
      }
    `,
    { branchId, date }
  )

  return initCashAtHandReport
}

export const useInitCashAtHandReport = ({ branchId = null, date = null }) => {
  const notEnabled = !branchId || !date
  return useQuery(
    ['initCashAtHandReport', branchId, date],
    () => initCashAtHandReport({ branchId, date }),
    {
      enabled: !notEnabled,
    }
  )
}
