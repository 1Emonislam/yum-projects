import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getLoanOfficersByBranchId = async branchId => {
  const { users } = await graphQLClient.request(
    gql`
      query users($branchId: ObjectId) {
        users(query: { role: "loanOfficer", branchId: $branchId }) {
          _id
          firstName
          lastName
          isDisabled
        }
      }
    `,
    { branchId }
  )

  return users
}

export const useBranchLoanOfficers = branchId => {
  return useQuery(
    'branchLoanOfficers',
    () => getLoanOfficersByBranchId(branchId),
    {
      enabled: !!branchId,
    }
  )
}
