import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useInfiniteQuery } from 'react-query'
import { rowsPerPage } from 'shared/yamrc'

const getClients = async ({
  status,
  role,
  userId,
  branchId,
  clientGroupId,
  pageParam,
}) => {
  const limit = rowsPerPage

  let query = {}

  if (status === 'active') {
    query.status_in = ['active', 'toSurvey']
  } else {
    query.status = status
  }

  if (pageParam) {
    query._id_lt = pageParam
  }

  switch (role) {
    case 'admin':
      query.clientGroupId = {
        status_nin: ['draft', 'pending', 'rejected', 'deleted'],
      }
      break
    case 'areaManager':
      query.clientGroupId = {
        status_nin: ['draft', 'pending', 'rejected', 'deleted'],
      }
      break
    case 'regionalManager':
      query.clientGroupId = {
        status_nin: ['draft', 'pending', 'rejected', 'deleted'],
      }
      break
    case 'branchManager':
      query.clientGroupId = {
        status_nin: ['draft', 'pending', 'rejected', 'deleted'],
        branchId: { _id: branchId },
      }
      break
    case 'loanOfficer':
      query.clientGroupId = {
        status_nin: ['draft', 'pending', 'rejected', 'deleted'],
        loanOfficerId: { _id: userId },
      }
      break
  }

  if (role === 'admin' && branchId !== '' && branchId !== 'undefined') {
    query.clientGroupId.branchId = { _id: branchId }
  }

  if (clientGroupId && clientGroupId !== '' && clientGroupId !== 'undefined') {
    query.clientGroupId._id = clientGroupId
  }

  const { clients } = await graphQLClient.request(
    gql`
      query getClients($query: ClientQueryInput, $limit: Int) {
        clients(query: $query, limit: $limit) {
          _id
          code
          firstName
          lastName
          clientGroup: clientGroupId {
            branch: branchId {
              name
            }
            cashier: cashierId {
              _id
            }
            name
            president: presidentId {
              _id
            }
            secretary: secretaryId {
              _id
            }
          }
          updatedAt
        }
      }
    `,
    {
      query,
      limit,
    }
  )
  return clients
}

export const useSecureClients = ({
  status,
  role,
  userId,
  branchId,
  clientGroupId,
}) => {
  return useInfiniteQuery(
    ['clients', status, role, userId, branchId, clientGroupId],
    ({ pageParam }) =>
      getClients({ status, role, userId, branchId, clientGroupId, pageParam }),
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
