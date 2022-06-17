import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getClientGroup = async ({ id, role, userId, branchId }) => {
  let query = {
    _id: id,
  }

  switch (role) {
    case 'loanOfficer':
      query.loanOfficerId = { _id: userId }
      break
    case 'branchManager':
      query.branchId = { _id: branchId }
      break
  }

  const { clientGroup } = await graphQLClient.request(
    gql`
      query clientGroup($query: ClientGroupQueryInput) {
        clientGroup(query: $query) {
          _id
          name
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
          status
        }
      }
    `,
    { query }
  )

  return clientGroup
}

export const useSecureClientGroup = ({ id, role, userId, branchId }) => {
  return useQuery(
    ['clientGroup', id, role, userId, branchId],
    () => getClientGroup({ id, role, userId, branchId }),
    {
      enabled: !!id && !!role && !!userId,
    }
  )
}
