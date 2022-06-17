import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getClientGroups = async () => {
  const { clientGroups } = await graphQLClient.request(
    gql`
      query {
        clientGroups(sortBy: _ID_DESC) {
          _id
          name
          code
          branch: branchId {
            _id
            name
          }
          meeting {
            time
            address
          }
          loanOfficer: loanOfficerId {
            _id
            name
          }
        }
      }
    `
  )

  return clientGroups
}

export const useClientGroups = () => {
  return useQuery('allClientGroups', getClientGroups)
}
