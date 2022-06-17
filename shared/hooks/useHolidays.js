import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getHolidays = async () => {
  const { holidays } = await graphQLClient.request(
    gql`
      query {
        holidays {
          _id
          name
          startAt
          endAt
          yearly
          notes
        }
      }
    `
  )

  return holidays
}

export const useHolidays = () => {
  return useQuery('holidays', getHolidays)
}
