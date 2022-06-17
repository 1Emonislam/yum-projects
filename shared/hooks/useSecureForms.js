import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useInfiniteQuery } from 'react-query'
import { rowsPerPage } from 'shared/yamrc'

const getForms = async ({ status, role, userId, branchId, pageParam }) => {
  const limit = rowsPerPage

  let query = {}

  query.status = status

  if (pageParam) {
    query.code_lt = pageParam
  }

  if (pageParam) {
    query['_id_lt'] = pageParam
  }

  switch (role) {
    case 'admin':
      query.clientId = {
        clientGroupId: {
          status_nin: ['draft', 'pending', 'rejected', 'deleted'],
        },
      }
      break
    case 'branchManager':
      query.clientId = {
        clientGroupId: {
          status_nin: ['draft', 'pending', 'rejected', 'deleted'],
          branchId: { _id: branchId },
        },
      }
      break
    case 'loanOfficer':
      query.clientId = {
        clientGroupId: {
          status_nin: ['draft', 'pending', 'rejected', 'deleted'],
          loanOfficerId: { _id: userId },
        },
      }
      break
  }

  const { forms } = await graphQLClient.request(
    gql`
      query getForms($query: FormQueryInput, $limit: Int) {
        forms(query: $query, limit: $limit) {
          _id
          code
          type
          client: clientId {
            _id
            firstName
            lastName
            clientGroup: clientGroupId {
              name
            }
          }
          updatedAt
        }
      }
    `,
    { query, limit }
  )

  return forms
}

export const useSecureForms = ({ status, role, userId, branchId }) => {
  return useInfiniteQuery(
    ['forms', status, role, userId, branchId],
    ({ pageParam }) => getForms({ status, role, userId, branchId, pageParam }),
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
