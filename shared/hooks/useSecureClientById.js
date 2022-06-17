import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getClientById = async ({ id, role, userId, branchId }) => {
  let query = {
    _id: id,
  }

  switch (role) {
    case 'loanOfficer':
      query.clientGroupId = { loanOfficerId: { _id: userId } }
      break
    case 'branchManager':
      query.clientGroupId = { branchId: { _id: branchId } }
      break
  }

  const { client } = await graphQLClient.request(
    gql`
      query client($query: ClientQueryInput) {
        client(query: $query) {
          _id
          admissionAt
          code
          firstName
          lastName
          lastRenewalAt
          passbook
          photo
          securityBalance
          status
          clientGroup: clientGroupId {
            _id
            branch: branchId {
              _id
              name
            }
            cashier: cashierId {
              _id
            }
            code
            name
            president: presidentId {
              _id
            }
            secretary: secretaryId {
              _id
            }
          }
          admission {
            notes
            address
          }
        }
      }
    `,
    { query }
  )

  return client
}

export const useSecureClientById = ({ id, role, userId, branchId }) => {
  return useQuery(
    ['clientById', id, role, userId, branchId],
    () => getClientById({ id, role, userId, branchId }),
    {
      enabled: !!id && !!role && !!userId,
    }
  )
}
