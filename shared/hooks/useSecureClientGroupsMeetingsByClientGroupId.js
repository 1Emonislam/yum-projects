import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getClientGroupsMeetingsByClientGroupId = async ({
  id,
  role,
  userId,
  branchId,
}) => {
  let query = { clientGroupId: { _id: id } }

  switch (role) {
    case 'loanOfficer':
      query.clientGroupId.loanOfficerId = { _id: userId }
      break
    case 'branchManager':
      query.clientGroupId.branchId = { _id: branchId }
      break
  }

  const { clientGroupsMeetings } = await graphQLClient.request(
    gql`
      query clientGroupsMeetings($query: ClientGroupsMeetingQueryInput) {
        clientGroupsMeetings(query: $query, sortBy: _ID_DESC) {
          _id
          attendance {
            clientId
            firstName
            lastName
            attended
            representative
          }
          installments {
            todaysRealization
          }
          endedAt
          notes
          photo
          requests
          scheduledAt
          startedAt
        }
      }
    `,
    { query }
  )

  return clientGroupsMeetings
}

export const useSecureClientGroupsMeetingsByClientGroupId = ({
  id,
  role,
  userId,
  branchId,
}) => {
  return useQuery(
    ['clientsGroupsMeetingsByClientGroupId', id, role, userId, branchId],
    () =>
      getClientGroupsMeetingsByClientGroupId({ id, role, userId, branchId }),
    {
      enabled: !!id && !!role && !!userId,
    }
  )
}
