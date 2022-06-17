import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getClientGroupsMeetingById = async ({ id, role, userId, branchId }) => {
  let query = { _id: id }

  if (['loanOfficer', 'branchManager'].includes(role)) {
    query.clientGroupId = {}
  }

  switch (role) {
    case 'loanOfficer':
      query.clientGroupId.loanOfficerId = { _id: userId }
      break
    case 'branchManager':
      query.clientGroupId.branchId = { _id: branchId }
      break
  }

  const { clientGroupsMeeting } = await graphQLClient.request(
    gql`
      query clientGroupsMeeting($query: ClientGroupsMeetingQueryInput) {
        clientGroupsMeeting(query: $query) {
          _id
          attendance {
            clientId
            firstName
            lastName
            attended
            representative
          }
          endedAt
          installments {
            installment
            overdue
            overdueInstallments
            cumulativeRealization
            openingBalance
            todaysRealization
            clientId
            approvedAmount
          }
          notes
          photoUrl
          requests
          scheduledAt
          startedAt
        }
      }
    `,
    { query }
  )

  return clientGroupsMeeting
}

export const useSecureClientGroupsMeetingById = ({
  id,
  role,
  userId,
  branchId,
}) => {
  return useQuery(
    ['clientGroupsMeetingById', id, role, userId, branchId],
    () => getClientGroupsMeetingById({ id, role, userId, branchId }),
    {
      enabled: id && role && userId ? true : false,
    }
  )
}
