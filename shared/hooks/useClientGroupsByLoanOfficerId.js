import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getClientGroupsByLoanOfficerId = async loanOfficerId => {
  const { clientGroups = [] } = await graphQLClient.request(
    gql`
      query clientGroups($loanOfficerId: ObjectId) {
        clientGroups(
          query: { loanOfficerId: { _id: $loanOfficerId } }
          sortBy: _ID_DESC
        ) {
          _id
          name
        }
      }
    `,
    { loanOfficerId }
  )

  return clientGroups
}

export const useClientGroupsByLoanOfficerId = loanOfficerId =>
  useQuery(
    ['clientGroupsByLoanOfficerId', loanOfficerId],
    () => getClientGroupsByLoanOfficerId(loanOfficerId),
    {
      enabled: !!loanOfficerId,
    }
  )
