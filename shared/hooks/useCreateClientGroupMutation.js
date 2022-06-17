import { getClientGroupsCount } from './useClientGroupsCount'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useMutation } from 'react-query'
import { useUserProfile } from './useUserProfile'
import moment from 'moment-timezone'

export const useCreateClientGroupMutation = () => {
  const { _id, branchId } = useUserProfile()

  return useMutation(async data => {
    const clientGroupsCount = await getClientGroupsCount()

    const code = [
      'G',
      String(Number(clientGroupsCount + 1)).padStart(3, '0'),
    ].join('')

    const { address, dayOfWeek, frequency, lat, lng, name, startedAt, time } =
      data

    return await graphQLClient.request(
      gql`
        mutation addEvent($input: EventInsertInput!) {
          addEvent(input: $input) {
            _id
          }
        }
      `,
      {
        input: {
          type: 'create',
          obj: 'clientGroup',
          userId: _id,
          payload: {
            name,
            code,
            meeting: {
              dayOfWeek: dayOfWeek || moment(startedAt).isoWeekday(),
              frequency,
              startedAt,
              time,
              address,
              lat,
              lng,
            },
            status: 'draft',
            loanOfficerId: _id,
            branchId,
          },
          timestamp: moment().format(),
        },
      }
    )
  })
}
