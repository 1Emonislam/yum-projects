import { gql } from 'graphql-request'
import { useQuery } from 'react-query'
import { graphQLClient } from '../services'

const getLoansByClientId = async clientId => {
  const { loans } = await graphQLClient.request(
    gql`
      query getLoansByClientId($clientId: ObjectId) {
        loans(query: { clientId: { _id: $clientId } }, sortBy: UPDATEDAT_DESC) {
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
        }
      }
    `,
    { clientId }
  )

  return loans
}

export const useLoansByClientId = clientId => {
  return useQuery('loansByClientId', () => getLoansByClientId(clientId), {
    enabled: !!clientId,
  })
}
