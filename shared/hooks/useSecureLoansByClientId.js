import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getLoansByClientId = async ({ id, role, userId, branchId }) => {
  let query = {
    clientId: {
      _id: id,
    },
  }

  switch (role) {
    case 'loanOfficer':
      query.clientId.clientGroupId = { loanOfficerId: { _id: userId } }
      break
    case 'branchManager':
      query.clientId.clientGroupId = { branchId: { _id: branchId } }
      break
  }

  const { loans } = await graphQLClient.request(
    gql`
      query loans($query: LoanQueryInput) {
        loans(query: $query, sortBy: CODE_DESC) {
          _id
          approvedAmount
          code
          cycle
          duration {
            value
            unit
          }
          installments {
            due
            principalRepayment
            interest
            realization
            total
            target
            status
          }
          loanProductName
          requestedAmount
          status
          updatedAt
          createdAt
        }
      }
    `,
    { query }
  )

  return loans
}

export const useSecureLoansByClientId = ({ id, role, userId, branchId }) => {
  return useQuery(
    ['loansByClientId', id, role, userId, branchId],
    () => getLoansByClientId({ id, role, userId, branchId }),
    {
      enabled: !!id && !!role && !!userId,
    }
  )
}
