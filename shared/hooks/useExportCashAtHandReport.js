import { useMutation } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const exportCashAtHandReport = async ({ start, end }) => {
  console.log('exportCashAtHandReport')

  const { exportCashAtHandReport } = await graphQLClient.request(
    gql`
      mutation exportCashAtHandReport($start: String, $end: String) {
        exportCashAtHandReport(input: { start: $start, end: $end }) {
          url
        }
      }
    `,
    {
      start,
      end,
    }
  )

  return exportCashAtHandReport?.url
}

export const useExportCashAtHandReport = () => {
  return useMutation(exportCashAtHandReport)
}
