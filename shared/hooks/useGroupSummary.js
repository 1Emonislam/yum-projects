import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getGroupSummary = async ({ loanOfficerId, date }) => {
  const { clientGroupSummary } = await graphQLClient.request(
    gql`
      query clientGroupSummary($loanOfficerId: ObjectId, $date: String) {
        clientGroupSummary(loanOfficerId: $loanOfficerId, date: $date) {
          loanOfficerName
          loanOfficerId
          clientGroupName
          clientGroupId
          realizable
          realization
          advance
          odCollection
          newOverdue
        }
      }
    `,
    { loanOfficerId, date }
  )

  return clientGroupSummary
}

export const useGroupSummary = ({ loanOfficerId, date }) => {
  return useQuery(
    ['clientGroupSummary', loanOfficerId, date],
    () => getGroupSummary({ loanOfficerId, date }),
    {
      enabled: !!loanOfficerId && !!date,
    }
  )
}
