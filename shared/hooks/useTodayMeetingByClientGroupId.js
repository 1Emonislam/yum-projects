import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

export const useTodayMeetingByClientGroupId = clientGroupId => {
  return useQuery(['todayMeetingByClientGroupId', clientGroupId], async () => {
    return await graphQLClient.request(
      gql`
        query todayMeeting($clientGroupId: String) {
          todayMeeting(input: $clientGroupId) {
            clientGroup: clientGroupId {
              _id
              code
              name
              meeting {
                address
                time
              }
            }
            _id
            attendance {
              attended
              firstName
              lastName
              representative
              clientId
            }
            startedAt
            endedAt
            notes
            requests
            installments {
              _id
              loanId
              durationValue
              durationUnit
              installment
              overdue
              overdueInstallments
              openingBalance
              todaysRealization
              clientId
              approvedAmount
              cumulativeRealization
            }
            potentialClientsVerified
            photoUrl
            scheduledAt
          }
        }
      `,
      { clientGroupId }
    )
  })
}
