import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getClientGroups = async ({ status, role, userId, branchId }) => {
  let query = {}

  switch (role) {
    case 'admin':
      query.status_nin = ['draft', 'deleted']
      break
    case 'branchManager':
      query.status_nin = ['draft', 'deleted']
      query.branchId = { _id: branchId }
      break
    case 'loanOfficer':
      query.status_nin = ['deleted']
      query.loanOfficerId = { _id: userId }
      break
  }

  if (status !== '') {
    query.status = status
  }

  const { clientGroups } = await graphQLClient.request(
    gql`
      query clientGroups($query: ClientGroupQueryInput) {
        clientGroups(query: $query, limit: 1000, sortBy: CODE_DESC) {
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

  return clientGroups
}

export const useSecureClientGroups = ({ status, role, userId, branchId }) => {
  return useQuery(
    ['clientGroups', status, role, userId, branchId],
    () => getClientGroups({ status, role, userId, branchId }),
    {
      enabled: !!role && !!userId,
    }
  )
}
