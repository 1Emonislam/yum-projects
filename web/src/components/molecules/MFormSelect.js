import { Controller } from 'react-hook-form'
import { required } from 'shared'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import React from 'react'
import InputLabel from '@material-ui/core/InputLabel'

const MFormSelect = ({
  control,
  defaultValue = false,
  disabled,
  displayEmpty = true,
  errors,
  label,
  name,
  rules = { required: { value: true, message: required } },
  options = [],
}) => (
  <Controller
    name={name}
    control={control}
    defaultValue={defaultValue}
    render={({ value, onChange }) => (
      <FormControl
        fullWidth
        variant="outlined"
        error={!!errors[name]}
        disabled={disabled}
      >
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          onChange={onChange}
          label={label}
          displayEmpty={displayEmpty}
        >
          {options.map((option, index) => (
            <MenuItem key={index} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText style={{ marginTop: -4, paddingBottom: 2 }}>
          {errors[name] ? errors[name].message : ' '}
        </FormHelperText>
      </FormControl>
    )}
    rules={rules}
  />
)

export default MFormSelect
