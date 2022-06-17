import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useMutation } from 'react-query'

const collectInstallment = async input => {
  const { client } = await graphQLClient.request(
    gql`
      mutation collectInstallment($input: CollectInstallmentInput) {
        collectInstallment(input: $input)
      }
    `,
    {
      input,
    }
  )

  return client
}

export const useCollectInstallment = () => {
  return useMutation(collectInstallment)
}
