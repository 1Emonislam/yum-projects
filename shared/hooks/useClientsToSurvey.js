import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getClientsToSurvey = async () => {
  const { clientsToSurvey } = await graphQLClient.request(
    gql`
      query {
        clientsToSurvey {
          _id
          firstName
          lastName
          clientGroup {
            _id
            name
            meeting {
              dayOfWeek
            }
            branch {
              _id
              name
            }
          }
        }
      }
    `
  )

  return clientsToSurvey
}

export const useClientsToSurvey = () => {
  return useQuery('clientsToSurvey', getClientsToSurvey)
}
