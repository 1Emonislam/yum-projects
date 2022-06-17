import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getFormsByStatus = async status => {
  const { forms } = await graphQLClient.request(
    gql`
      query forms($status: String) {
        forms(query: { status: $status }, sortBy: CODE_DESC) {
          _id
          code
          type
          client: clientId {
            _id
            firstName
            lastName
            clientGroup: clientGroupId {
              name
            }
          }
          updatedAt
        }
      }
    `,
    { status }
  )

  return forms
}

export const useFormsByStatus = status => {
  return useQuery(['formsByStatus', status], () => getFormsByStatus(status))
}
