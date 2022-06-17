import {
  strongPasswordRegExRule,
  required,
  useChangePasswordMutation,
} from 'shared'
import { makeStyles } from '@material-ui/core/styles'
import { useForm } from 'react-hook-form'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import MFormTextField from '../molecules/MFormTextField'
import MGeneralErrorDialog from '../molecules/MGeneralErrorDialog'
import React, { useState } from 'react'
import TSettings from '../templates/TSettings'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  appbar: {
    borderBottomColor: theme.palette.grey[300],
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
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
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:focus': {
      outline: 'none',
    },
  },
  warning: {
    paddingLeft: 12,
    borderLeft: '8px solid',
    borderLeftColor: theme.palette.warning.main,
    '& svg': {
      marginLeft: -16,
    },
  },
  chip: {
    backgroundColor: theme.palette.warning.main,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  formControl: {
    width: '100%',
  },
  danger: {
    background: theme.palette.error.main,
    color: '#fff',
  },
}))

const PChangePassword = () => {
  const classes = useStyles()

  const space = 4

  const [isProcessing, setIsProcessing] = useState(false)
  const [generalErrorDialog, setGeneralErrorDialog] = useState(false)
  const [success, setSuccess] = useState(false)

  const { control, handleSubmit, errors, setError } = useForm()

  const { mutate } = useChangePasswordMutation()

  const onSubmit = async data => {
    if (data.passwordNew !== data.passwordConfirmation) {
      setError('passwordConfirmation', {
        type: 'manual',
        message: 'Passwords do not match',
      })
      return
    }

    delete data.passwordConfirmation

    setIsProcessing(true)

    await mutate(data, {
      onError: () => {
        setIsProcessing(false)
        setGeneralErrorDialog(true)
        setSuccess(false)
      },
      onSuccess: () => {
        setIsProcessing(false)
        setSuccess(true)
      },
    })
  }

  return (
    <TSettings active="password">
      <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
        <Box
          display="flex"
          alignItems="center"
          pl={2}
          pr={1}
          className={classes.bar}
          height={53}
          flexShrink={0}
        >
          <Typography variant="h2">Password</Typography>
          <Box flexGrow={1} />
          {!isProcessing && !success && (
            <Box p={1}>
              <Button variant="contained" color="primary" type="submit">
                Change password
              </Button>
            </Box>
          )}
          {!isProcessing && success && <Box p={1}>Password changed</Box>}
          {isProcessing && (
            <Box pr={3}>
              <CircularProgress color="secondary" size={24} />
            </Box>
          )}
        </Box>
        <Box
          flexGrow={1}
          width="100%"
          overflow="auto"
          display="flex"
          justifyContent="center"
          pl={2}
          pr={1}
          pt={2}
          pb={8}
        >
          <Box display="flex" justifyContent="center">
            <Box width={460}>
              <Box pt={space}>
                <Box width={300} display="flex" flexDirection="column">
                  <MFormTextField
                    label="Current password"
                    name="passwordCurrent"
                    type="password"
                    control={control}
                    errors={errors}
                    autoFocus
                  />
                  <MFormTextField
                    label="New password"
                    name="passwordNew"
                    type="password"
                    control={control}
                    errors={errors}
                    rules={{
                      ...strongPasswordRegExRule,
                      required: { value: true, message: required },
                    }}
                  />
                  <MFormTextField
                    label="Confirm password"
                    name="passwordConfirmation"
                    type="password"
                    control={control}
                    errors={errors}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </form>
      <MGeneralErrorDialog
        visible={generalErrorDialog}
        onDismiss={() => setGeneralErrorDialog(false)}
      />
    </TSettings>
  )
}

export default PChangePassword
