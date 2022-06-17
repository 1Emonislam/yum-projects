import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getLoanDisbursementsByBranchId = async branchId => {
  const { loansToDisburse } = await graphQLClient.request(
    gql`
      query loansToDisburse($branchId: ObjectId) {
        loansToDisburse(query: { branchId: { _id: $branchId } }) {
          _id
          clientId {
            _id
          }
          code
          cycle
          approvedAmount
          requestedAmount
          forms {
            inspection {
              content {
                loan {
                  amount
                  duration {
                    value
                    unit
                  }
                }
              }
              client: clientId {
                firstName
                lastName
                group: clientGroupId {
                  name
                  meeting {
                    dayOfWeek
                    startedAt
                    frequency
                  }
                }
              }
            }
          }
          loanProduct: loanProductId {
            name
            cashCollateral {
              initialLoan
              furtherLoans
            }
            loanInsurance
            loanProcessingFee {
              type
              value
            }
          }
        }
      }
    `,
    { branchId }
  )

  return loansToDisburse
}

export const useLoanDisbursementsByBranchId = branchId => {
  return useQuery(
    'loanDisbursementsByBranchId',
    () => getLoanDisbursementsByBranchId(branchId),
    {
      enabled: !!branchId,
    }
  )
}
