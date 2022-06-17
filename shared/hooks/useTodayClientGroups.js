import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getTodayClientGroups = async () => {
  const { todayClientGroups = [] } = await graphQLClient.request(
    gql`
      query {
        todayClientGroups {
          _id
          name
          meeting {
            dayOfWeek
            address
            time
          }
        }
      }
    `
  )

  return todayClientGroups
}

export const useTodayClientGroups = () => {
  return useQuery('todayClientGroups', getTodayClientGroups)
}
