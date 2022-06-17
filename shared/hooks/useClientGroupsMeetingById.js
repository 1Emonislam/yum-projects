import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getClientGroupsMeetingById = async _id => {
  const { clientGroupsMeeting } = await graphQLClient.request(
    gql`
      query clientGroupsMeeting($_id: ObjectId) {
        clientGroupsMeeting(query: { _id: $_id }) {
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
            clientId
            clientName
            due
            openingBalance
            realization
            status
            target
            total
          }
          notes
          photoUrl
          requests
          scheduledAt
          startedAt
        }
      }
    `,
    { _id }
  )

  return clientGroupsMeeting
}

export const useClientGroupsMeetingById = id => {
  return useQuery(
    ['clientGroupsMeetingById', id],
    () => getClientGroupsMeetingById(id),
    {
      enabled: !!id,
    }
  )
}
