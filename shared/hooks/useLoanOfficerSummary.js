import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getLoanOfficerSummary = async ({ branchId, date }) => {
  const { loanOfficerSummary } = await graphQLClient.request(
    gql`
      query loanOfficerSummary($branchId: ObjectId, $date: String) {
        loanOfficerSummary(branchId: $branchId, date: $date) {
          loanOfficerName
          loanOfficerId
          realizable
          realization
          advance
          odCollection
          newOverdue
        }
      }
    `,
    { branchId, date }
  )

  return loanOfficerSummary
}

export const useLoanOfficerSummary = ({ branchId = null, date = null }) => {
  return useQuery(
    ['loanOfficerSummary', branchId, date],
    () => getLoanOfficerSummary({ branchId, date }),
    {
      enabled: !!branchId && !!date,
    }
  )
}
