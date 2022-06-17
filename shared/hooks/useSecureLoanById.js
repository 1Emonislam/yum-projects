import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getLoanById = async ({ id, role, userId, branchId }) => {
  let query = {
    _id: id,
  }

  if (['loanOfficer', 'branchManager'].includes(role)) {
    query.clientId = {}
    query.clientId.clientGroupId = {}
  }

  switch (role) {
    case 'loanOfficer':
      query.clientId.clientGroupId.loanOfficerId = { _id: userId }
      break
    case 'branchManager':
      query.clientId.clientGroupId.branchId = { _id: branchId }
      break
  }

  const { loan } = await graphQLClient.request(
    gql`
      query loan($query: LoanQueryInput) {
        loan(query: $query) {
          _id
          approvedAmount
          branch: branchId {
            _id
            name
            initDate
            initOpeningBalance
          }
          branchManagerName
          cashCollateral
          client: clientId {
            firstName
            lastName
            securityBalance
            clientGroup: clientGroupId {
              meeting {
                dayOfWeek
              }
            }
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
          disbursementAt
          disbursementPhoto {
            uri
            lat
            lng
          }
          edited
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
            _id
            due
            principalRepayment
            interest
            realization
            total
            target
            status
          }
          interestRate
          loanInsurance
          loanOfficerName
          loanProcessingFee {
            type
            value
          }
          loanProduct: loanProductId {
            durations {
              weekly
              biweekly
              monthly
            }
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
    { query }
  )

  return loan
}

export const useSecureLoanById = ({ id, role, userId, branchId }) => {
  return useQuery(
    ['loanById', id, role, userId, branchId],
    () => getLoanById({ id, role, userId, branchId }),
    {
      enabled: !!id && !!role && !!userId,
    }
  )
}
