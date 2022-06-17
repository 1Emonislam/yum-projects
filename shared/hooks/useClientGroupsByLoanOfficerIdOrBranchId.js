import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getClientGroupsByLoanOfficerIdOrBranchId = async ({ id, by }) => {
  let query = {}

  if (!id || !by) {
    return []
  }

  switch (by) {
    case 'branch':
      query.branchId = { _id: id }
      break
    default:
      query.loanOfficerId = { _id: id }
      break
  }

  const { clientGroups } = await graphQLClient.request(
    gql`
      query getClientGroups($query: ClientGroupQueryInput) {
        clientGroups(query: $query, sortBy: _ID_DESC) {
          _id
          name
        }
      }
    `,
    {
      query,
    }
  )

  return clientGroups
}

export const useClientGroupsByLoanOfficerIdOrBranchId = ({ id, by }) =>
  useQuery(['clientGroupsByLoanOfficerIdOrBranchId', id, by], () =>
    getClientGroupsByLoanOfficerIdOrBranchId({ id, by })
  )
