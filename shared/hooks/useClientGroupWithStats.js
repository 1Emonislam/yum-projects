import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

export const useClientGroupWithStats = (_id, options = {}) => {
  return useQuery(
    ['clientGroupWithStats', _id],
    async () => {
      const { clientGroupWithStats } = await graphQLClient.request(
        gql`
          query clientGroupWithStats($_id: String) {
            clientGroupWithStats(input: $_id) {
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
              loansOutstanding
              securityBalance
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
              wasRejected
            }
          }
        `,
        { _id }
      )

      return clientGroupWithStats
    },
    options
  )
}
