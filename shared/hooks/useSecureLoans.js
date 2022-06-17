import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useInfiniteQuery } from 'react-query'
import { rowsPerPage } from 'shared/yamrc'

const getLoans = async ({ status, role, userId, branchId, pageParam }) => {
  const limit = rowsPerPage

  let query = {}

  if (status !== '') {
    query.status = status
  }

  if (pageParam) {
    query._id_lt = pageParam
  }

  query.clientId = {}
  query.clientId.clientGroupId = {}

  switch (role) {
    case 'admin':
      query.clientId.clientGroupId.status_nin = [
        'draft',
        'pending',
        'rejected',
        'deleted',
      ]
      break
    case 'branchManager':
      query.clientId.clientGroupId = {
        status_nin: ['draft', 'pending', 'rejected', 'deleted'],
        branchId: { _id: branchId },
      }
      break
    case 'loanOfficer':
      query.clientId.clientGroupId = {
        status_nin: ['draft', 'pending', 'rejected', 'deleted'],
        loanOfficerId: { _id: userId },
      }
      break
  }

  const { loans } = await graphQLClient.request(
    gql`
      query getLoans($query: LoanQueryInput, $limit: Int) {
        loans(query: $query, limit: $limit) {
          _id
          code
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
      }
    `,
    { query, limit }
  )

  return loans
}

export const useSecureLoans = ({ status, role, userId, branchId }) => {
  return useInfiniteQuery(
    ['loans', status, role, userId, branchId],
    ({ pageParam }) => getLoans({ status, role, userId, branchId, pageParam }),
    {
      getNextPageParam: lastPage => {
        if (lastPage.length === rowsPerPage) {
          return lastPage[lastPage.length - 1]._id
        }

        return undefined
      },
      enabled: role && userId ? true : false,
    }
  )
}
