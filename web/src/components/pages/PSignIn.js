import React, { useCallback } from 'react'

import { useHistory, Redirect } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'

import parsePhoneNumber from 'libphonenumber-js'

import { useAuth } from 'shared'

import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

import TMinimal from '../templates/TMinimal'

const PSignIn = () => {
  const { control, handleSubmit, errors, setError } = useForm({
    defaultValues: {
      phoneNumber: '+256',
    },
  })
  const { initLogIn, isAuthenticated } = useAuth()

  const history = useHistory()

  const onSubmit = useCallback(
    async data => {
      try {
        const phoneNumber = parsePhoneNumber(data?.phoneNumber)
        if (!phoneNumber) {
          return setError('phoneNumber', {
            type: 'manual',
            message: 'Invalid phone number format',
          })
        }
        // console.log(phoneNumber)
        const r = await initLogIn(phoneNumber?.number)
        if (!r.data?.success) {
          setError('phoneNumber', {
            type: 'manual',
            message: 'Invalid phone number',
          })
        } else {
          console.log('-------pushing to verification')
          history.push('/verification', { phoneNumber: phoneNumber?.number })
        }
      } catch (error) {
        setError('phoneNumber', {
          type: 'manual',
          message:
            error?.response?.data?.message?.toLowerCase() === 'user not found'
              ? 'Invalid phone number'
              : 'Error occurred, try again',
        })
      }
    },
    [history, setError]
  )

  if (isAuthenticated) {
    // return <p>Still authenticated</p>
    return <Redirect to="/app" />
  }

  return (
    <TMinimal>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box width={300} display="flex" flexDirection="column">
          <Controller
            name="phoneNumber"
            control={control}
            render={({ onChange, value }) => (
              <TextField
                type="tel"
                label="Your phone number"
                variant="outlined"
                value={value}
                onChange={onChange}
                error={!!errors.phoneNumber}
                helperText={
                  !!errors.phoneNumber ? errors?.phoneNumber?.message : ''
                }
                autoFocus
              />
            )}
          />
          <Button variant="contained" color="primary" type="submit">
            Continue
          </Button>
        </Box>
      </form>
    </TMinimal>
  )
}

export default PSignIn
