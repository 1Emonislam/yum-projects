import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getClientSummary = async ({ clientGroupId, date }) => {
  const { clientSummary } = await graphQLClient.request(
    gql`
      query clientSummary($clientGroupId: ObjectId, $date: String) {
        clientSummary(clientGroupId: $clientGroupId, date: $date) {
          loanOfficerName
          loanOfficerId
          clientGroupName
          clientGroupId
          clientName
          clientId
          realizable
          realization
          advance
          odCollection
          newOverdue
        }
      }
    `,
    { clientGroupId, date }
  )

  return clientSummary
}

export const useClientSummary = ({ clientGroupId, date }) => {
  return useQuery(
    ['clientSummary', clientGroupId, date],
    () => getClientSummary({ clientGroupId, date }),
    {
      enabled: !!clientGroupId && !!date,
    }
  )
}
