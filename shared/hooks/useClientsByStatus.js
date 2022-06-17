import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getClientsByStatus = async status => {
  const { clients } = await graphQLClient.request(
    gql`
      query clients($status: String) {
        clients(query: { status: $status }, sortBy: CODE_DESC) {
          _id
          code
          firstName
          lastName
          clientGroup: clientGroupId {
            name
            branch: branchId {
              name
            }
          }
          updatedAt
        }
      }
    `,
    { status }
  )

  return clients
}

export const useClientsByStatus = status => {
  return useQuery(['clientsByStatus', status], () => getClientsByStatus(status))
}
