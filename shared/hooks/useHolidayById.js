import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getHolidayById = async _id => {
  const { holiday } = await graphQLClient.request(
    gql`
      query holiday($_id: ObjectId) {
        holiday(query: { _id: $_id }) {
          _id
          name
          startAt
          endAt
          yearly
          notes
        }
      }
    `,
    { _id }
  )

  return holiday
}

export const useHolidayById = id => {
  return useQuery(['holidayById', id], () => getHolidayById(id), {
    enabled: !!id,
  })
}
