import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useMutation } from 'react-query'

const disburseLoan = async input => {
  await graphQLClient.request(
    gql`
      mutation disburseLoan($input: DisburseLoanInput) {
        disburseLoan(input: $input) {
          status
        }
      }
    `,
    {
      input,
    }
  )
}

export const useDisburseLoan = () => {
  return useMutation(disburseLoan)
}
