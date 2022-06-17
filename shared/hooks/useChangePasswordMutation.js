import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useMutation } from 'react-query'

const changePassword = async input => {
  await graphQLClient.request(
    gql`
      mutation changePassword($input: ChangePasswordInput!) {
        changePassword(input: $input) {
          status
        }
      }
    `,
    {
      input,
    }
  )
}

export const useChangePasswordMutation = () => {
  return useMutation(changePassword)
}
