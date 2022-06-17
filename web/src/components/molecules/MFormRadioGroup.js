import { Controller } from 'react-hook-form'
import { required } from 'shared'
import Box from '@material-ui/core/Box'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormLabel from '@material-ui/core/FormLabel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import React from 'react'

const MFormRadioGroup = ({
  control,
  options = [],
  defaultValue = '',
  errors,
  helperText = ' ',
  label,
  name,
  row = true,
  rules = { required: { value: true, message: required } },
  additionalSpace = false,
}) => (
  <Box pb={additionalSpace ? 2 : 0}>
    <FormLabel component="legend">{label}</FormLabel>
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ value, onChange }) => (
        <RadioGroup
          aria-label={name}
          row={row}
          name={name}
          value={value}
          onChange={onChange}
        >
          {options.map(option => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
            />
          ))}
        </RadioGroup>
      )}
      rules={rules}
    />
  </Box>
)

export default MFormRadioGroup
