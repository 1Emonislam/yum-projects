import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useMutation } from 'react-query'

export const useInsertEvent = options => {
  return useMutation(async (data = {}) => {
    const { _id: objId, type = null, obj = null, ...payload } = data

    if (type === null) {
      throw new Error('type has to be create | update | delete')
    }

    if (obj === null) {
      throw new Error('obj cannot be empty')
    }

    return await graphQLClient.request(
      gql`
        mutation insertEvent($input: EventInsertInput!) {
          addEvent(input: $input) {
            _id
            objId
          }
        }
      `,
      {
        input: {
          type,
          obj,
          objId: objId || undefined,
          payload,
        },
      }
    )
  }, options)
}
