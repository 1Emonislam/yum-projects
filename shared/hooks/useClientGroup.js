import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

export const useClientGroup = _id => {
  return useQuery(['clientGroup', _id], async () => {
    const { clientGroup } = await graphQLClient.request(
      gql`
        query clientGroup($_id: ObjectId) {
          clientGroup(query: { _id: $_id }) {
            _id
            name
            cashier: cashierId {
              _id
              firstName
              lastName
            }
            code
            branch: branchId {
              _id
              name
            }
            meeting {
              address
              time
              dayOfWeek
              lat
              lng
              startedAt
              frequency
            }
            loanOfficer: loanOfficerId {
              _id
              firstName
              lastName
            }
            president: presidentId {
              _id
              firstName
              lastName
            }
            secretary: secretaryId {
              _id
              firstName
              lastName
            }
            status
          }
        }
      `,
      { _id: _id }
    )

    return clientGroup
  })
}
