import {
  useMoveClientToAnotherclientGroup,
  useSecureClientGroupsByBranchId,
} from 'shared'
import { useForm } from 'react-hook-form'
import { useQueryClient } from 'react-query'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import MFormRadioGroup from '../molecules/MFormRadioGroup'
import MGeneralErrorDialog from '../molecules/MGeneralErrorDialog'
import React, { Fragment, useEffect, useState } from 'react'

const OReplaceClientGroupDialog = ({
  onClose,
  open,
  client,
  role,
  userId,
  branchId,
}) => {
  const queryClient = useQueryClient()

  const [isProcessing, setIsProcessing] = useState(false)
  const [generalErrorDialog, setGeneralErrorDialog] = useState(false)

  const { data: clientGroups = [] } = useSecureClientGroupsByBranchId({
    role,
    userId,
    branchId,
    sortBy: 'name',
  })

  const { mutate } = useMoveClientToAnotherclientGroup()

  const { control, handleSubmit, errors } = useForm()

  const onSubmit = async data => {
    setIsProcessing(true)

    await mutate(
      {
        clientId: String(client._id),
        clientGroupId: data.clientGroup,
      },
      {
        onError: () => {
          console.log('Mutation #1: onError')

          setIsProcessing(false)
          onClose()
          setGeneralErrorDialog(true)
        },
        onSuccess: async () => {
          console.log('Mutation #1: onSuccess')

          setIsProcessing(false)

          queryClient.invalidateQueries('clientById')
          queryClient.invalidateQueries('loanById')

          onClose()
        },
      }
    )
  }

  return (
    <Fragment>
      <Dialog
        open={open}
        onClose={onClose}
        scroll="paper"
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            <Box>
              Move the client from the “
              {String(client?.clientGroup.name).trim()}” group to…
            </Box>
          </DialogTitle>
          <DialogContent
            dividers
            style={{
              maxHeight: 'calc(100vh - 192px)',
            }}
          >
            <MFormRadioGroup
              name="clientGroup"
              defaultValue=""
              control={control}
              errors={errors}
              row={false}
              options={clientGroups
                .filter(
                  group => String(group?._id) !== String(client?.clientGroupId)
                )
                .sort((a, b) => {
                  const a_ = String(a.name).toLowerCase()
                  const b_ = String(b.name).toLowerCase()

                  if (a_ > b_) {
                    return 1
                  }

                  if (a_ < b_) {
                    return -1
                  }

                  return 0
                })
                .map(clientGroup => ({
                  label: clientGroup.name,
                  value: String(clientGroup._id),
                }))}
            />
          </DialogContent>
          <DialogActions style={{ fontSize: '1rem' }}>
            {!isProcessing && (
              <Fragment>
                <Button color="primary" onClick={onClose}>
                  Cancel
                </Button>
                <Button color="primary" type="submit">
                  Move
                </Button>
              </Fragment>
            )}
            {isProcessing && (
              <Box pr={2} style={{ paddingTop: '6px' }}>
                <CircularProgress color="secondary" size={24} />
              </Box>
            )}
          </DialogActions>
        </form>
      </Dialog>
      <MGeneralErrorDialog
        visible={generalErrorDialog}
        onDismiss={() => setGeneralErrorDialog(false)}
      />
    </Fragment>
  )
}

export default OReplaceClientGroupDialog
