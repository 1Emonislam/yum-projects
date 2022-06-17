import { useCallback } from 'react'
import _ from 'lodash'
import { useQueryClient } from 'react-query'
import { useTodayMeetingByClientGroupId } from './useTodayMeetingByClientGroupId'
import { useInsertEvent } from './useInsertEvent'

export const useMeetingLogic = clientGroupId => {
  const queryClient = useQueryClient()
  const {
    data: { todayMeeting = null } = {},
    isFetching,
    isLoading,
  } = useTodayMeetingByClientGroupId(clientGroupId)
  const queryData = ['todayMeetingByClientGroupId', clientGroupId]
  const { mutate: mutateOriginal, isLoading: isMutationLoading } =
    useInsertEvent({
      // OPTIMISTIC UPDATE
      onMutate: async rawTodayMeeting => {
        await queryClient.cancelQueries(queryData)
        const previousTodayMeeting = queryClient.getQueryData(queryData)
        const newTodayMeeting = {
          todayMeeting: {
            ...previousTodayMeeting.todayMeeting,
            ...rawTodayMeeting,
            clientGroupId: previousTodayMeeting.todayMeeting.clientGroupId,
          },
        }
        queryClient.setQueryData(queryData, newTodayMeeting)
        return {
          previousTodayMeeting,
          newTodayMeeting,
        }
      },
      onError: (err, newTodayMeeting, context) => {
        queryClient.setQueryData(queryData, context.previousTodayMeeting)
      },
      onSettled: () => {
        queryClient.invalidateQueries(queryData)
      },
    })

  const mutate = useCallback(
    data => {
      const preparedData = {
        obj: 'clientGroupMeeting',
        type: 'update',
        // TODO: try to get rid of that
        ..._.omit(todayMeeting, ['clientGroup']),
        clientGroupId,
        ...data,
      }
      mutateOriginal(preparedData)
    },
    [todayMeeting, clientGroupId, mutateOriginal]
  )
  const loading = isFetching || isLoading || isMutationLoading

  return [todayMeeting, mutate, loading]
}
