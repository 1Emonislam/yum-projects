import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getBranchById = async id => {
  const { branch } = await graphQLClient.request(
    gql`
      query {
        branch(query: { _id: $id }) {
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
          others {
            servicingBanks
            majorCompetitors
            outreach
          }
          status
        }
      }
    `,
    {
      id,
    }
  )

  return branch
}

export const useBranchById = id => {
  return useQuery('branchById', () => getBranchById(id), {
    enabled: !!id,
  })
}
