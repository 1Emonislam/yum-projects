import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getBranchOverview = async ({ branchId, date }) => {
  const { branchOverview } = await graphQLClient.request(
    gql`
      query branchOverview($branchId: ObjectId, $date: String) {
        branchOverview(branchId: $branchId, date: $date) {
          newAdmissions {
            _id
            code
            firstName
            lastName
            updatedAt
            clientGroup: clientGroupId {
              branch: branchId {
                name
              }
              name
            }
          }
          clientsWithPassbooksIssuedOrRenewed {
            _id
            code
            firstName
            lastName
            updatedAt
            clientGroup: clientGroupId {
              branch: branchId {
                name
              }
              name
            }
          }
          newLoanApplications {
            _id
            code
            clientGroupName
            client: clientId {
              _id
              firstName
              lastName
            }
            cycle
            branch: branchId {
              _id
            }
            branchName
            loanOfficer: loanOfficerId {
              _id
            }
            loanOfficerName
            loanProductName
            loanProduct: loanProductId {
              _id
            }
            duration {
              value
              unit
            }
            requestedAmount
            approvedAmount
            status
            updatedAt
          }
          clientsWithSecurityAdjustments {
            _id
            code
            firstName
            lastName
            updatedAt
            clientGroup: clientGroupId {
              branch: branchId {
                name
              }
              name
            }
          }
          securityBalances {
            _id
            change
            client {
              _id
              code
              firstName
              lastName
              updatedAt
              clientGroup: clientGroupId {
                branch: branchId {
                  name
                }
                name
              }
            }
          }
          disbursements {
            _id
            code
            client: clientId {
              _id
              firstName
              lastName
            }
            clientGroupName
            cycle
            branch: branchId {
              _id
            }
            branchName
            loanOfficer: loanOfficerId {
              _id
            }
            loanOfficerName
            loanProductName
            loanProduct: loanProductId {
              _id
            }
            duration {
              value
              unit
            }
            requestedAmount
            approvedAmount
            status
            updatedAt
          }
        }
      }
    `,
    { branchId, date }
  )

  return branchOverview
}

export const useBranchOverview = ({ branchId, date }) => {
  return useQuery(
    ['branchOverview', branchId, date],
    () => getBranchOverview({ branchId, date }),
    {
      enabled: !!branchId && !!date,
    }
  )
}
