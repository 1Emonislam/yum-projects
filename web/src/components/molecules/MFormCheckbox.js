import { Controller } from 'react-hook-form'
import { required } from 'shared'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import React from 'react'

const MFormCheckbox = ({
  control,
  defaultValue = false,
  errors,
  label,
  name,
  rules = { required: { value: true, message: required } },
}) => (
  <Controller
    name={name}
    control={control}
    defaultValue={defaultValue}
    render={({ value, onChange }) => (
      <FormControl error={!!errors[name]}>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={value}
              onChange={event => onChange(event.target.checked)}
            />
          }
          label={label}
        />
        <FormHelperText style={{ marginTop: -4, paddingBottom: 2 }}>
          {errors[name] ? errors[name].message : ' '}
        </FormHelperText>
      </FormControl>
    )}
    rules={rules}
  />
)

export default MFormCheckbox
