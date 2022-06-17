import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

export const getFormsCount = async () => {
  const response = await graphQLClient.request(
    gql`
      query {
        formsCount
      }
    `
  )

  return response.formsCount
}

export const useFormsCount = () => useQuery('formsCount', getFormsCount)
