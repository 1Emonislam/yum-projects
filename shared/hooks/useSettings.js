import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getSettings = async () => {
  const { settings } = await graphQLClient.request(
    gql`
      query {
        settings {
          name
          value
        }
      }
    `
  )

  return settings
}

export const useSettings = () => {
  return useQuery('settings', getSettings)
}
