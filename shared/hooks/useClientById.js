import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getClientById = async _id => {
  const { client } = await graphQLClient.request(
    gql`
      query client($_id: ObjectId) {
        client(query: { _id: $_id }) {
          _id
          code
          firstName
          lastName
          addedAt
          admissionAt
          lastRenewalAt
          photo
          securityBalance
          status
          passbook
          clientGroup: clientGroupId {
            _id
            cashier: cashierId {
              _id
            }
            code
            branch: branchId {
              _id
              name
            }
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
    { _id: _id }
  )

  return client
}

export const useClientById = id => {
  return useQuery(['clientById', id], () => getClientById(id), {
    enabled: !!id,
  })
}
