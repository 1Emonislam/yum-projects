import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getBranches = async () => {
  const { branches } = await graphQLClient.request(
    gql`
      query {
        branches {
          _id
          name
          code
          address {
            street
            area
            subcounty
            county
            district
          }
          initDate
          initOpeningBalance
          others {
            servicingBanks
            majorCompetitors
            outreach
          }
          status
        }
      }
    `
  )

  return branches
}

export const useBranches = options => {
  return useQuery('branches', getBranches, options)
}
