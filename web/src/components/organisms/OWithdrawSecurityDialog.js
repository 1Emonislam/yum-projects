import { makeStyles } from '@material-ui/core/styles'
import { required, useWithdrawSecurity } from 'shared'
import { useForm } from 'react-hook-form'
import { useQueryClient } from 'react-query'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import InputAdornment from '@material-ui/core/InputAdornment'
import MFormTextField from '../molecules/MFormTextField'
import MGeneralErrorDialog from '../molecules/MGeneralErrorDialog'
import numeral from 'numeral'
import React, { Fragment, useMemo, useState } from 'react'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  action: {
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: '36px',
  },
  bar: {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.grey[300],
  },
  button: {
    background: 'none',
    border: 0,
    padding: 0,
    margin: 0,
    fontSize: 'inherit',
    letterSpacing: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:focus': {
      outline: 'none',
    },
  },
  th: {
    fontSize: '13px',
    lineHeight: 1.5,
  },
  caption: {
    color: theme.palette.grey[500],
    fontSize: '0.9rem',
  },
  amount: {
    '& input, & + p': { textAlign: 'right' },
  },
}))

const OWithdrawSecurityDialog = ({ client, onClose, open }) => {
  const classes = useStyles()

  const queryClient = useQueryClient()

  const { mutate: withdrawSecurity } = useWithdrawSecurity()

  const [isProcessing, setIsProcessing] = useState(false)
  const [generalErrorDialog, setGeneralErrorDialog] = useState(false)

  const { control, handleSubmit, errors, watch } = useForm()

  const amountValue = watch('amount')

  const closingSecurityBalance = useMemo(() => {
    const openingSecurityBalance = client?.securityBalance || 0

    const amount = amountValue || 0

    return openingSecurityBalance - amount
  }, [client, amountValue])

  const onSubmit = data => {
    setIsProcessing(true)

    const { amount, argumentation } = data

    withdrawSecurity(
      {
        clientId: String(client._id),
        amount,
        argumentation,
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
          queryClient.invalidateQueries('loanById') // It's required for the "Collect installments" dialog

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
            <Box>Withdraw security</Box>
          </DialogTitle>
          <DialogContent dividers style={{ paddingTop: 18, paddingBottom: 0 }}>
            <Box display="flex" justifyContent="space-between" pb={2}>
              <Box>
                <Typography variant="body1">
                  Opening security balance:
                </Typography>
              </Box>
              <Typography variant="body1">
                USh {numeral(client?.securityBalance).format('0,0')}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" pb={2}>
              <Box pt={2} pr={2}>
                <Typography variant="body1">Amount to withdraw:</Typography>
              </Box>
              <MFormTextField
                name="amount"
                control={control}
                errors={errors}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">USh</InputAdornment>
                  ),
                  className: classes.amount,
                }}
                helperText={`USh ${numeral(amountValue).format('0,0')}`}
                defaultValue=""
                autoFocus
                rules={{
                  required: { value: true, message: required },
                  validate: value => {
                    if (isNaN(value)) {
                      return String(value).includes(',')
                        ? 'Please enter a number without commas'
                        : 'Please enter a number'
                    }

                    if (String(value).includes('.')) {
                      return 'Please enter a number without dots'
                    }

                    if (value < 0) {
                      return 'Please enter a number greater than zero'
                    }

                    if (value > client.securityBalance) {
                      return 'Please enter a number less than the opening security balance'
                    }

                    return true
                  },
                  valueAsNumber: true,
                }}
              />
            </Box>
            <Box display="flex" justifyContent="space-between" pb={2}>
              <Box pr={4}>
                <Typography variant="body1">
                  Closing security balance:
                </Typography>
              </Box>
              {Number(amountValue) <= client?.securityBalance &&
                Number(amountValue) > 0 && (
                  <Typography variant="body1">
                    USh {numeral(closingSecurityBalance).format('0,0')}
                  </Typography>
                )}
              {(Number(amountValue) > client?.securityBalance ||
                isNaN(amountValue) ||
                Number(amountValue) < 1) && (
                <Typography variant="body1">—</Typography>
              )}
            </Box>
            <Box>
              <Typography variant="body1">Argumentation:</Typography>
              <Typography variant="body1" className={classes.caption}>
                Why are you withdrawing security?
              </Typography>
            </Box>
            <MFormTextField
              name="argumentation"
              control={control}
              errors={errors}
              defaultValue=""
              multiline
              rows={4}
            />
          </DialogContent>
          <DialogActions style={{ fontSize: '1rem' }}>
            {!isProcessing && (
              <Fragment>
                <Button color="primary" onClick={onClose}>
                  Cancel
                </Button>
                <Button color="primary" type="submit">
                  Withdraw
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

export default OWithdrawSecurityDialog
