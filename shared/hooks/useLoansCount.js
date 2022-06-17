import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

export const getLoansCount = async () => {
  const response = await graphQLClient.request(
    gql`
      query {
        loansCount
      }
    `
  )

  return response.loansCount
}

export const useLoansCount = () => useQuery('loansCount', getLoansCount)
