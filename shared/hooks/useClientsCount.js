import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

export const getClientsCount = async () => {
  const response = await graphQLClient.request(
    gql`
      query {
        clientsCount
      }
    `
  )

  return response.clientsCount
}

export const useClientsCount = () => useQuery('clientsCount', getClientsCount)
