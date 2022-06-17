import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useMutation } from 'react-query'

const updateLoan = async input => {
  await graphQLClient.request(
    gql`
      mutation updateLoan($input: UpdateLoanInput) {
        updateLoan(input: $input)
      }
    `,
    {
      input,
    }
  )
}

export const useUpdateLoan = () => {
  return useMutation(updateLoan)
}
