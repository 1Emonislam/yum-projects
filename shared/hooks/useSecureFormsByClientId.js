import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getFormsByClientId = async ({ id, role, userId, branchId }) => {
  let query = {
    clientId: { _id: id },
  }

  switch (role) {
    case 'loanOfficer':
      query.clientId.clientGroupId = { loanOfficerId: { _id: userId } }
      break
    case 'branchManager':
      query.clientId.clientGroupId = { branchId: { _id: branchId } }
      break
  }

  const { forms } = await graphQLClient.request(
    gql`
      query forms($query: FormQueryInput) {
        forms(query: $query, sortBy: CODE_DESC) {
          _id
          code
          createdAt
          status
          type
          updatedAt
          user: userId {
            firstName
            lastName
          }
        }
      }
    `,
    { query }
  )

  return forms
}

export const useSecureFormsByClientId = ({ id, role, userId, branchId }) => {
  return useQuery(
    ['formsByClientId', id, role, userId, branchId],
    () => getFormsByClientId({ id, role, userId, branchId }),
    {
      enabled: !!id && !!role && !!userId,
    }
  )
}
