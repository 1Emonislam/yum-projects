import { _ } from 'lodash'
import { Controller } from 'react-hook-form'
import { required } from 'shared'
import { Text } from 'react-native-paper'
import { View } from 'react-native'
import AHelperText from '@atoms/AHelperText'
import MCurrencyInput from '@molecules/MCurrencyInput'
import MError from '@molecules/MError'
import React from 'react'

const MFormCurrency = ({
  autoFocus,
  control,
  defaultValue = '',
  errors,
  helperText,
  label,
  name,
  readOnly,
  rules = { required: { value: true, message: required }, valueAsNumber: true },
}) => (
  <View style={{ paddingTop: 16 }}>
    <Text>{label}:</Text>
    <Controller
      control={control}
      render={({ onChange, onBlur, value }) => (
        <MCurrencyInput
          autoFocus={autoFocus}
          error={_.get(errors, name)}
          onBlur={onBlur}
          onChangeText={value => onChange(value)}
          value={String(value)}
          readOnly={readOnly}
        />
      )}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
    />
    {helperText && <AHelperText>{helperText}</AHelperText>}
    <MError errors={errors} name={name} />
  </View>
)

export default MFormCurrency
