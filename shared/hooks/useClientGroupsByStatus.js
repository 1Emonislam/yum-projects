import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getClientGroupsByStatus = async status => {
  const query =
    status === ''
      ? { status_nin: ['draft', 'pending', 'rejected', 'deleted'] }
      : { status }

  const { clientGroups } = await graphQLClient.request(
    gql`
      query clientGroups($query: ClientGroupQueryInput) {
        clientGroups(query: $query, sortBy: CODE_DESC) {
          _id
          name
          code
          branch: branchId {
            _id
            name
          }
          meeting {
            time
            dayOfWeek
            address
          }
          loanOfficer: loanOfficerId {
            _id
            firstName
            lastName
          }
          status
        }
      }
    `,
    { query }
  )

  return clientGroups
}

export const useClientGroupsByStatus = status => {
  return useQuery(['clientGroupsByStatus', status], () =>
    getClientGroupsByStatus(status)
  )
}
