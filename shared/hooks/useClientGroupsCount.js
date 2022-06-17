import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

export const getClientGroupsCount = async () => {
  const response = await graphQLClient.request(
    gql`
      query {
        clientGroupsCount
      }
    `
  )

  return response.clientGroupsCount
}

export const useClientGroupsCount = () =>
  useQuery('clientGroupsCount', getClientGroupsCount)
