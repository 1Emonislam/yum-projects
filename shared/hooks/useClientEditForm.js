import { normalizeFullName } from '../utils'
import { useClientById } from './useClientById'
import { useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useInsertEvent } from './useInsertEvent'
import { useQueryClient } from 'react-query'
import omit from 'lodash/omit'

export const useClientEditForm = (
  clientId,
  { onSuccess = () => {}, onError = () => {} } = {}
) => {
  const queryClient = useQueryClient()
  const { data: client, isFetching } = useClientById(clientId)
  const { control, errors, handleSubmit, reset, watch } = useForm()
  const { mutate, isLoading: isSubmitting } = useInsertEvent()

  useEffect(() => {
    if (client) {
      const {
        firstName,
        lastName,
        admission: { address, notes },
        clientGroup: { _id: clientGroupId },
      } = client

      const initValues = {
        firstName,
        lastName,
        clientGroupId,
        admission: {
          address,
          notes,
        },
      }

      reset(initValues)
    }
  }, [client, reset])

  const onValid = useCallback(
    async data => {
      const mutationData = {
        type: 'update',
        obj: 'client',
        ...omit(client, ['clientGroup']),
        ...data,
        ...normalizeFullName(data),
      }
      await mutate(mutationData, {
        onSuccess: () => {
          queryClient.invalidateQueries(['clientById', client._id])
          queryClient.invalidateQueries('clientsByClientGroupId')
          onSuccess()
        },
        onError,
      })
    },
    [client, mutate, onError, onSuccess, queryClient]
  )

  const submit = handleSubmit(onValid)

  return {
    submit,
    control,
    errors,
    isFetching,
    isSubmitting,
    watch,
  }
}
