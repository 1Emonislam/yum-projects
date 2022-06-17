import React from 'react'

import { ErrorMessage } from '@hookform/error-message'

import AHelperText from '@atoms/AHelperText'

const MError = ({ errors, name }) => (
  <ErrorMessage
    errors={errors}
    name={name}
    render={({ message }) => <AHelperText error>{message}</AHelperText>}
  />
)

export default MError
