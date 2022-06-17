import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getLoanById = async _id => {
  const { loan } = await graphQLClient.request(
    gql`
      query loan($_id: ObjectId) {
        loan(query: { _id: $_id }) {
          _id
          approvedAmount
          branchManagerName
          cashCollateral
          client: clientId {
            _id
            firstName
            lastName
            securityBalance
          }
          clientGroup: clientGroupId {
            meeting {
              dayOfWeek
            }
          }
          clientGroupName
          code
          cycle
          duration {
            value
            unit
          }
          forms {
            application {
              _id
              code
              status
              user: userId {
                firstName
                lastName
              }
              createdAt
              updatedAt
            }
            inspection {
              _id
              code
              status
              user: userId {
                firstName
                lastName
              }
              createdAt
              updatedAt
            }
          }
          installments {
            due
            principalRepayment
            interest
            realization
            total
            target
          }
          interestRate
          loanInsurance
          loanOfficerName
          loanProcessingFee {
            type
            value
          }
          loanProduct: loanProductId {
            disbursementAllowCheques
          }
          loanProductName
          requestedAmount
          signatures {
            client
            branchManager
            loanOfficer
            witnesses {
              name
              signature
            }
          }
          status
          createdAt
        }
      }
    `,
    { _id }
  )

  return loan
}

export const useLoanById = id => {
  return useQuery(['loanById', id], () => getLoanById(id), {
    enabled: !!id,
  })
}
