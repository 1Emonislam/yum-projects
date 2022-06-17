import { useMutation } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const exportLoanReport = async () => {
  const { exportLoanReport } = await graphQLClient.request(
    gql`
      mutation {
        exportLoanReport {
          url
        }
      }
    `
  )

  return exportLoanReport?.url
}

export const useExportLoanReport = () => {
  return useMutation(exportLoanReport)
}
