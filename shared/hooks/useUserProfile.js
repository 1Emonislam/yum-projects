import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useAuth } from '../providers/AuthProvider'
import { useQuery } from 'react-query'
import isNil from 'lodash/isNil'

const fetchUserById = async _id => {
  const { user } = await graphQLClient.request(
    gql`
      query user($_id: ObjectId) {
        user(query: { _id: $_id }) {
          _id
          firstName
          lastName
          branchId
          role
        }
      }
    `,
    { _id: _id }
  )

  return user
}

export const useUserProfile = () => {
  const { isAuthenticated, id } = useAuth()

  const { data = {} } = useQuery(['users', id], () => fetchUserById(id), {
    enabled: isAuthenticated && !isNil(id),
  })

  // @FIXME handle null data (when db is re-seeded)
  return data || {}
}
