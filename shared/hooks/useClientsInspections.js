import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getClientsInspections = async () => {
  const { clientsInspections } = await graphQLClient.request(
    gql`
      query {
        clientsInspections {
          _id
          name
          address
          dayOfWeek
          frequency
          startedAt
          forms {
            client {
              _id
              firstName
              lastName
              address
            }
            group {
              _id
              name
              address
              dayOfWeek
              frequency
              startedAt
            }
            form {
              _id
            }
          }
        }
      }
    `
  )

  return clientsInspections
}

export const useClientsInspections = (options = {}) => {
  return useQuery('clientsInspections', () => getClientsInspections(), options)
}
