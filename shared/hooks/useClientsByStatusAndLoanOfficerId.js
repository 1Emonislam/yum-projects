import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getClientsByStatusAndLoanOfficerId = async ({
  status,
  loanOfficerId,
}) => {
  const { clients } = await graphQLClient.request(
    gql`
      query clientsByStatusAndLoanOfficerId(
        $status: String
        $loanOfficerId: ObjectId
      ) {
        clients(
          query: {
            status: $status
            clientGroupId: {
              status_nin: ["deleted"]
              loanOfficerId: { _id: $loanOfficerId }
            }
          }
        ) {
          _id
          code
          firstName
          lastName
          admissionAt
          photo
          status
          passbook
          loans
          clientGroup: clientGroupId {
            _id
            name
            branch: branchId {
              _id
              name
            }
            code
            meeting {
              dayOfWeek
              frequency
              startedAt
            }
          }
          admission {
            notes
            address
          }
        }
      }
    `,
    {
      status,
      loanOfficerId,
    }
  )

  return clients
}

export const useClientsByStatusAndLoanOfficerId = ({
  status,
  loanOfficerId,
}) => {
  return useQuery(
    ['clientsByStatusAndLoanOfficerId', status, loanOfficerId],
    () => getClientsByStatusAndLoanOfficerId({ status, loanOfficerId }),
    {
      enabled: !!status && !!loanOfficerId,
    }
  )
}
