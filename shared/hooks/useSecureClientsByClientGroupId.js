import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getClientsByClientGroupId = async ({ id, role, userId, branchId }) => {
  let query = {
    status_nin: ['deleted'],
    clientGroupId: { _id: id },
  }

  switch (role) {
    case 'loanOfficer':
      query.clientGroupId.loanOfficerId = { _id: userId }
      break
    case 'branchManager':
      query.clientGroupId.branchId = { _id: branchId }
      break
  }

  const { clients } = await graphQLClient.request(
    gql`
      query clients($query: ClientQueryInput) {
        clients(query: $query, sortBy: CODE_DESC) {
          _id
          code
          firstName
          lastName
          status
          loans
        }
      }
    `,
    { query }
  )

  return clients
}

export const useSecureClientsByClientGroupId = ({
  id,
  role,
  userId,
  branchId,
}) => {
  return useQuery(
    ['clientsByClientGroupId', id, role, userId, branchId],
    () => getClientsByClientGroupId({ id, role, userId, branchId }),
    {
      enabled: !!id && !!role && !!userId,
    }
  )
}
