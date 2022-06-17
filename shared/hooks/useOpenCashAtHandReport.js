import { useMutation } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const openCashAtHandReport = async ({ branchId, date, unlockReason = '' }) => {
  const { openCashAtHandReport } = await graphQLClient.request(
    gql`
      mutation openCashAtHandReport(
        $branchId: String
        $date: String
        $unlockReason: String
      ) {
        openCashAtHandReport(
          input: {
            branchId: $branchId
            date: $date
            unlockReason: $unlockReason
          }
        ) {
          status
        }
      }
    `,
    {
      branchId,
      date,
      unlockReason,
    }
  )

  return openCashAtHandReport
}

export const useOpenCashAtHandReport = () => {
  return useMutation(openCashAtHandReport)
}
