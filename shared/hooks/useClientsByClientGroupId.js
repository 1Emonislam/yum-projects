import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

export const useClientsByClientGroupId = _id => {
  return useQuery(['clientsByClientGroupId', _id], async () => {
    return await graphQLClient.request(
      gql`
        query clients($_id: ObjectId) {
          clients(
            query: { status_nin: "deleted", clientGroupId: { _id: $_id } }
          ) {
            _id
            code
            firstName
            lastName
            status
            loans
          }
        }
      `,
      { _id }
    )
  })
}
