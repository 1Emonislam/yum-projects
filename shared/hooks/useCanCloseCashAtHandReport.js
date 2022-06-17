import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const canCloseCashAtHandReport = async ({ branchId, date }) => {
  const { canCloseCashAtHandReport } = await graphQLClient.request(
    gql`
      query canCloseCashAtHandReport($branchId: String, $date: String) {
        canCloseCashAtHandReport(input: { branchId: $branchId, date: $date }) {
          canClose
          lastOpenDate
        }
      }
    `,
    { branchId, date }
  )

  return canCloseCashAtHandReport
}

export const useCanCloseCashAtHandReport = ({
  branchId = null,
  date = null,
}) => {
  const enabled = branchId !== null && date !== null
  return useQuery(
    ['canCloseCashAtHandReport', branchId, date],
    () => canCloseCashAtHandReport({ branchId, date }),
    {
      enabled,
    }
  )
}
