import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getTodayRealizations = async () => {
  const { todayRealizations = {} } = await graphQLClient.request(
    gql`
      query {
        todayRealizations {
          clientGroupsMeetings {
            todaysRealization
            overdue
            installment
          }
          total {
            todaysRealization
            overdue
            installment
          }
        }
      }
    `
  )

  return todayRealizations
}

export const useTodayRealizations = () => {
  return useQuery('todayRealizations', getTodayRealizations)
}
