import { useBranchLoanOfficers, useInsertEvent } from 'shared'
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
import React, { Fragment, useState } from 'react'

const OReplaceLoanOfficerDialog = ({ onClose, open, clientGroup }) => {
  const queryClient = useQueryClient()

  const { data: loanOfficers = [] } = useBranchLoanOfficers(
    clientGroup?.branch?._id
  )

  const [isProcessing, setIsProcessing] = useState(false)
  const [generalErrorDialog, setGeneralErrorDialog] = useState(false)

  const { mutate } = useInsertEvent()

  const { control, handleSubmit, errors } = useForm()

  const onSubmit = async data => {
    setIsProcessing(true)

    await mutate(
      {
        type: 'update',
        obj: 'clientGroup',
        _id: clientGroup._id,
        loanOfficerId: data.loanOfficer,
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

          queryClient.invalidateQueries('clientGroup')

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
        scroll="body"
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            <Box>
              Replace {clientGroup?.loanOfficer?.firstName}{' '}
              {clientGroup?.loanOfficer?.lastName} with…
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <MFormRadioGroup
              name="loanOfficer"
              defaultValue=""
              control={control}
              errors={errors}
              row={false}
              options={loanOfficers
                .filter(
                  loanOfficer =>
                    String(loanOfficer?._id) !==
                      String(clientGroup?.loanOfficer?._id) &&
                    !loanOfficer.isDisabled
                )
                .sort((a, b) => {
                  const aFirstName = String(a.firstName).toLowerCase()
                  const aLastName = String(a.lastName).toLowerCase()
                  const bFirstName = String(b.firstName).toLowerCase()
                  const bLastName = String(b.lastName).toLowerCase()

                  if (aLastName === bLastName) {
                    if (aFirstName > bFirstName) {
                      return 1
                    }

                    if (aFirstName < bFirstName) {
                      return -1
                    }

                    return 0
                  }

                  if (aLastName > bLastName) {
                    return 1
                  }

                  if (aLastName < bLastName) {
                    return -1
                  }

                  return 0
                })
                .map(loanOfficer => ({
                  label: `${loanOfficer.lastName}, ${loanOfficer.firstName}`,
                  value: String(loanOfficer._id),
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
                  Replace
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

export default OReplaceLoanOfficerDialog
