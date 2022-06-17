import { gql } from 'graphql-request'
import { useQuery } from 'react-query'
import { graphQLClient } from '../services'

const getFormsByClientId = async clientId => {
  const { forms } = await graphQLClient.request(
    gql`
      query getFormsByClientId($clientId: ObjectId) {
        forms(query: { clientId: { _id: $clientId } }, sortBy: UPDATEDAT_DESC) {
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
    { clientId }
  )

  return forms
}

export const useFormsByClientId = clientId => {
  return useQuery(
    ['formsByClientId', clientId],
    () => getFormsByClientId(clientId),
    {
      enabled: !!clientId,
    }
  )
}
