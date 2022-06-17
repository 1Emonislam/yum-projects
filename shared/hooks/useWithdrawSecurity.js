import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useMutation } from 'react-query'

const withdrawSecurity = async input => {
  await graphQLClient.request(
    gql`
      mutation withdrawSecurity($input: WithdrawSecurityInput) {
        withdrawSecurity(input: $input) {
          status
        }
      }
    `,
    {
      input,
    }
  )
}

export const useWithdrawSecurity = () => {
  return useMutation(withdrawSecurity)
}
