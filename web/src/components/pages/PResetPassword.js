import React, { useCallback } from 'react'

import { useLocation, useHistory, Redirect } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { required, strongPasswordRegExRule, useAuth } from 'shared'

import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import MFormTextField from '../molecules/MFormTextField'
import Typography from '@material-ui/core/Typography'

import TMinimal from '../templates/TMinimal'

const PResetPassword = () => {
  const location = useLocation()
  const history = useHistory()
  const { isAuthenticated, logIn, resetPassword } = useAuth()
  const { phoneNumber } = location.state

  const { control, handleSubmit, errors, setError } = useForm({
    defaultValues: {
      code: '',
    },
  })

  const onSubmit = useCallback(
    async data => {
      if (data.passwordNew !== data.passwordConfirmation) {
        setError('passwordConfirmation', {
          type: 'manual',
          message: 'Passwords do not match',
        })
        return
      }

      try {
        const apiResponse = await resetPassword(
          phoneNumber,
          data.passwordNew,
          data.code
        )

        const { data: result } = apiResponse

        if (result.success) {
          await logIn(phoneNumber, data.passwordNew)
          history.push('/app')
          return
        }

        setError('code', {
          type: 'manual',
          message: 'Please provide a valid SMS code',
        })
      } catch (error) {
        console.dir(error)
        setError('code', { type: 'manual', message: 'Invalid code' })
        // FIXME: network errors properly
      }
    },
    [phoneNumber, history, setError]
  )

  if (isAuthenticated) {
    return <Redirect to="/app" />
  }

  if (!location?.state?.phoneNumber) {
    return <Redirect to="/" />
  }

  return (
    <TMinimal>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box width={300} display="flex" flexDirection="column">
            <Box pb={3}>
              <Typography variant="h1">Reset password</Typography>
              <Box pt={1}>
                <Typography variant="body2">
                  Enter the code we have sent to {phoneNumber} and type in a new
                  password
                </Typography>
              </Box>
            </Box>
            <MFormTextField
              label="SMS code"
              name="code"
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
            <Button variant="contained" color="primary" type="submit">
              Reset password
            </Button>
          </Box>
        </Box>
      </form>
    </TMinimal>
  )
}

export default PResetPassword
