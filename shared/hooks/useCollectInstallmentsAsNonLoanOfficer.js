import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useMutation } from 'react-query'

const collectInstallmentAsNonLoanOfficer = async input => {
  await graphQLClient.request(
    gql`
      mutation collectInstallmentAsNonLoanOfficer(
        $input: CollectInstallmentAsNonLoanOfficerInput
      ) {
        collectInstallmentAsNonLoanOfficer(input: $input) {
          status
        }
      }
    `,
    {
      input,
    }
  )
}

export const useCollectInstallmentsAsNonLoanOfficer = () => {
  return useMutation(collectInstallmentAsNonLoanOfficer)
}
