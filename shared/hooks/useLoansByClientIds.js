import { gql } from 'graphql-request'
import { useQuery } from 'react-query'
import { graphQLClient } from '../services'

const getLoansByClientIds = async (clientIds = []) => {
  const { loans } = await graphQLClient.request(
    gql`
      query getLoansByClientIds($clientIds: [ObjectId]) {
        loans(query: { clientId: { _id_in: $clientIds } }) {
          _id
          clientId {
            _id
            name
          }
          createdAt
          # installments {
          #   due
          #   status
          # }
          loanProductId {
            _id
          }
          requestedAmount
          status
          updatedAt
        }
      }
    `,
    { clientIds }
  )

  return loans
}

export const useLoansByClientIds = (clientIds = []) => {
  const enabled = Array.isArray(clientIds) && clientIds?.length !== 0
  return useQuery('loansByClientIds', () => getLoansByClientIds(clientIds), {
    enabled,
  })
}
