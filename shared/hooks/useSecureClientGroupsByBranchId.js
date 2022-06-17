import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getClientGroupsByBranchId = async ({
  role,
  userId,
  branchId,
  sortBy,
}) => {
  if (branchId === '' || branchId === 'undefined') {
    return []
  }

  let query = {}

  query.branchId = { _id: branchId }

  switch (role) {
    case 'admin':
      query.status_nin = ['draft', 'pending', 'deleted']
      break
    case 'branchManager':
      query.status_nin = ['draft', 'pending', 'deleted']
      break
    case 'loanOfficer':
      query.status_nin = ['deleted']
      query.loanOfficerId = { _id: userId }
      break
  }

  const { clientGroups } = await graphQLClient.request(
    gql`
      query clientGroups(
        $query: ClientGroupQueryInput
        $sortBy: ClientGroupSortByInput
      ) {
        clientGroups(query: $query, limit: 1000, sortBy: $sortBy) {
          _id
          name
        }
      }
    `,
    { query, sortBy: sortBy === 'name' ? 'NAME_ASC' : '_ID_DESC' }
  )

  return clientGroups
}

export const useSecureClientGroupsByBranchId = ({
  role,
  userId,
  branchId,
  sortBy,
}) => {
  const enabled =
    role && userId && branchId && branchId !== 'undefined' && branchId !== ''
      ? true
      : false

  return useQuery(
    ['clientGroupsByBranchId', role, userId, branchId, sortBy],
    () => getClientGroupsByBranchId({ status, role, userId, branchId, sortBy }),
    {
      enabled,
    }
  )
}
