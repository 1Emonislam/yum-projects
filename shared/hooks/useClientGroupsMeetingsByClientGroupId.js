import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getClientGroupsMeetingsByClientGroupId = async _id => {
  const { clientGroupsMeetings } = await graphQLClient.request(
    gql`
      query clientGroupsMeetings($_id: ObjectId) {
        clientGroupsMeetings(
          query: { clientGroupId: { _id: $_id } }
          sortBy: _ID_DESC
        ) {
          _id
          attendance {
            clientId
            firstName
            lastName
            attended
            representative
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
    { _id }
  )

  return clientGroupsMeetings
}

export const useClientGroupsMeetingsByClientGroupId = clientGroupId => {
  return useQuery(
    ['clientGroupsMeetingsByClientGroupId', clientGroupId],
    () => getClientGroupsMeetingsByClientGroupId(clientGroupId),
    {
      enabled: !!clientGroupId,
    }
  )
}
