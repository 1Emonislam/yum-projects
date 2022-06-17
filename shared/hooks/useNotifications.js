import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getNotifications = async () => {
  const { notifications } = await graphQLClient.request(
    gql`
      query {
        notifications {
          forms
          loans
          clientGroups
        }
      }
    `
  )

  return notifications
}

export const useNotifications = options =>
  useQuery('notifications', () => getNotifications(), options)
