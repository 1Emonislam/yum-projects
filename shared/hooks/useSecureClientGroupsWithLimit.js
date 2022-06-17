import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useInfiniteQuery } from 'react-query'
import { rowsPerPage } from 'shared/yamrc'

const getClientGroups = async ({
  status,
  role,
  userId,
  branchId,
  pageParam,
}) => {
  const limit = rowsPerPage

  let query = {}

  if (status !== '') {
    query.status = status
  }

  if (pageParam) {
    query._id_lt = pageParam
  }

  switch (role) {
    case 'admin':
      query.status_nin = ['draft', 'deleted']
      if (branchId && branchId !== '') {
        query.branchId = { _id: branchId }
      }
      break
    case 'areaManager':
      query.status_nin = ['draft', 'deleted']
      if (branchId && branchId !== '') {
        query.branchId = { _id: branchId }
      }
      break
    case 'regionalManager':
      query.status_nin = ['draft', 'deleted']
      if (branchId && branchId !== '') {
        query.branchId = { _id: branchId }
      }
      break
    case 'branchManager':
      query.status_nin = ['draft', 'deleted']
      query.branchId = { _id: branchId }
      break
    case 'loanOfficer':
      query.status_nin = ['deleted']
      query.loanOfficerId = { _id: userId }
      break
  }

  const { clientGroups } = await graphQLClient.request(
    gql`
      query getClientGroups($query: ClientGroupQueryInput, $limit: Int) {
        clientGroups(query: $query, limit: $limit) {
          _id
          name
          code
          branch: branchId {
            _id
            name
          }
          meeting {
            time
            dayOfWeek
            address
          }
          loanOfficer: loanOfficerId {
            _id
            firstName
            lastName
          }
          status
        }
      }
    `,
    { query, limit }
  )

  return clientGroups
}

export const useSecureClientGroupsWithLimit = ({
  status,
  role,
  userId,
  branchId,
}) => {
  return useInfiniteQuery(
    ['clientGroups', status, role, userId, branchId],
    ({ pageParam }) =>
      getClientGroups({ status, role, userId, branchId, pageParam }),
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
