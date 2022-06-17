import React, { useCallback, useState, useEffect } from 'react'

import { useLocation, useHistory, Redirect } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'

import { useAuth } from 'shared'

import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import TMinimal from '../templates/TMinimal'

const PSignInVerification = () => {
  const location = useLocation()
  const history = useHistory()
  const { isAuthenticated, initLogIn, logIn, requestPasswordReset } = useAuth()

  const { control, handleSubmit, errors, setError } = useForm({
    defaultValues: {
      code: '',
    },
  })

  const onSubmit = useCallback(
    async data => {
      try {
        const res = await logIn(location.state.phoneNumber, data.code)
        history.push('/app')
      } catch (error) {
        console.dir(error)
        setError('code', { type: 'manual', message: 'Invalid code' })
      }
    },
    [location, history, setError]
  )

  const onResetPassword = useCallback(
    async data => {
      try {
        const response = await requestPasswordReset(location.state.phoneNumber)
        const { data: resetPasswordResponse } = response
        if (resetPasswordResponse.success) {
          history.push('/reset-password', {
            phoneNumber: location.state.phoneNumber,
          })
        }
      } catch (error) {
        console.dir(error)
        setError('code', { type: 'manual', message: 'Invalid code' })
      }
    },
    [requestPasswordReset, location.state.phoneNumber, history, setError]
  )

  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    let timeout

    if (isResending) {
      timeout = setTimeout(() => {
        setIsResending(false)
      }, 10000)
    }

    return () => clearInterval(timeout)
  }, [isResending])

  const onResend = useCallback(async () => {
    setIsResending(true)
    try {
      const r = await initLogIn(location.state.phoneNumber)

      if (!r.data.success) {
        setError('code', {
          type: 'manual',
          message: 'Invalid phone number',
        })
      } else {
        // history.push('/verification', { phoneNumber: data.phoneNumber })
      }
    } catch (error) {
      console.error(error.message.substr(0, 10))

      setError('code', {
        type: 'manual',
        message: 'Invalid phone number',
      })
    }

    // setIsResending(false)
  }, [setError, location])

  if (isAuthenticated) {
    // return <p>Still authenticated</p>
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
            <Controller
              name="code"
              control={control}
              defaultValue=""
              render={({ value, onChange }) => (
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  value={value}
                  onChange={onChange}
                  error={!!errors.code}
                  helperText={errors.code ? errors.code.message : null}
                  autoFocus
                />
              )}
            />
            <Button variant="contained" color="primary" type="submit">
              Sign in
            </Button>
            <Button
              variant="text"
              color="primary"
              style={{ marginTop: 5 }}
              onClick={() => onResetPassword()}
            >
              I forgot my password
            </Button>
          </Box>
        </Box>
      </form>
    </TMinimal>
  )
}

export default PSignInVerification
