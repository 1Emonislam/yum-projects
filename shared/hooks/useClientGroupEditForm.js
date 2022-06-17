import { sanitize } from './../utils/sanitize'
import { useClientGroup } from './useClientGroup'
import { useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useInsertEvent } from './useInsertEvent'
import { useQueryClient } from 'react-query'
import identity from 'lodash/identity'
import omit from 'lodash/omit'
import pickBy from 'lodash/pickBy'

export const useClientGroupEditForm = (
  clientGroupId,
  { onSuccess = () => {}, onError = () => {} } = {}
) => {
  const queryClient = useQueryClient()
  const { data: clientGroup, isFetching } = useClientGroup(clientGroupId)
  const { control, errors, getValues, handleSubmit, reset, setValue, watch } =
    useForm()
  const { mutate, isLoading: isSubmitting } = useInsertEvent()

  useEffect(() => {
    if (clientGroup && clientGroup.meeting) {
      const {
        name,
        code,
        meeting: { address, dayOfWeek, lat, lng, time, startedAt, frequency },
        president,
        secretary,
        cashier,
      } = clientGroup

      const initValues = {
        name,
        code,
        meeting: {
          address,
          dayOfWeek,
          lat,
          lng,
          time,
          startedAt,
          frequency,
        },
        presidentId: president?._id,
        presidentName: president?._id
          ? `${president.lastName}, ${president.firstName}`
          : undefined,
        secretaryId: secretary?._id,
        secretaryName: secretary?._id
          ? `${secretary.lastName}, ${secretary.firstName}`
          : undefined,
        cashierId: cashier?._id,
        cashierName: cashier?._id
          ? `${cashier.lastName}, ${cashier.firstName}`
          : undefined,
      }

      reset(initValues)
    }
  }, [clientGroup, reset])

  const ensureNoEmptyRoleIds = data => {
    return pickBy(data, identity)
  }

  const onValid = useCallback(
    async data => {
      const { meeting, ...rest } = data

      const mutationData = {
        type: 'update',
        obj: 'clientGroup',
        ...omit(clientGroup, [
          'branch',
          'cashier',
          'loanOfficer',
          'president',
          'secretary',
        ]),
        ...omit(ensureNoEmptyRoleIds(rest), [
          'cashierName',
          'presidentName',
          'secretaryName',
        ]),
        meeting: sanitize({
          ...clientGroup.meeting,
          address: meeting.address,
          time: meeting.time,
        }),
      }

      await mutate(mutationData, {
        onSuccess: () => {
          queryClient.invalidateQueries('clientGroup')
          queryClient.invalidateQueries('clientGroups')
          queryClient.invalidateQueries('clientGroupWithStats')
          queryClient.invalidateQueries('clientsByClientGroupId')
          onSuccess()
        },
        onError,
      })
    },
    [clientGroup, mutate, onError, onSuccess, queryClient]
  )

  const submit = handleSubmit(onValid)

  return {
    clientGroup,
    control,
    errors,
    getValues,
    isFetching,
    isSubmitting,
    setValue,
    submit,
    watch,
  }
}
