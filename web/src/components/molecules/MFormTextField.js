import { Controller } from 'react-hook-form'
import { required } from 'shared'
import Box from '@material-ui/core/Box'
import React from 'react'
import TextField from '@material-ui/core/TextField'

const MFormTextField = ({
  additionalSpace = false,
  autoFocus,
  className = '',
  control,
  defaultValue = '',
  errors,
  helperText = ' ',
  InputProps,
  label,
  multiline,
  name,
  rows,
  rules = { required: { value: true, message: required } },
  type = 'text',
}) => (
  <Box pb={additionalSpace ? 2 : 0}>
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ value, onChange }) => (
        <TextField
          label={label}
          variant="outlined"
          value={label && type !== 'password' ? value || ' ' : value}
          onChange={onChange}
          error={!!errors[name]}
          helperText={errors[name] ? errors[name].message : helperText}
          autoFocus={autoFocus}
          className={className}
          InputProps={InputProps}
          multiline={multiline}
          rows={rows}
          type={type}
          fullWidth
        />
      )}
      rules={rules}
    />
  </Box>
)

export default MFormTextField
