import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getBranches = async ({ role, branchId }) => {
  if (!role || role === 'loanOfficer') {
    return
  }

  let query = {}

  if (role === 'branchManager') {
    query._id = branchId
  }

  const { branches } = await graphQLClient.request(
    gql`
      query getBranches($query: BranchQueryInput) {
        branches(query: $query) {
          _id
          name
          initDate
          initOpeningBalance
        }
      }
    `,
    { query }
  )

  return branches
}

export const useSecureBranches = ({ role, branchId }) => {
  return useQuery(
    ['branches', role, branchId],
    () => getBranches({ role, branchId })
    //, TODO: These checks aren't required since data is filtered during MongoDB query execution.
    // {
    //   enabled:
    //     role && (role === 'admin' || (role === 'branchManager' && branchId))
    //       ? true
    //       : false,
    // }
  )
}
