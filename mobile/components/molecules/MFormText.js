import { _ } from 'lodash'
import { Controller } from 'react-hook-form'
import { required } from 'shared'
import { Text } from 'react-native-paper'
import { View } from 'react-native'
import AHelperText from '@atoms/AHelperText'
import ATextInput from '@atoms/ATextInput'
import MError from '@molecules/MError'
import React from 'react'

const MFormText = ({
  autoFocus,
  control,
  defaultValue = '',
  errors,
  helperText,
  keyboardType = 'default',
  label,
  multiline,
  name,
  numberOfLines,
  onSubmitEditing,
  readOnly,
  render,
  rules = { required: { value: true, message: required } },
  secureTextEntry,
}) => (
  <View style={{ paddingTop: 16 }}>
    <Text>{label}:</Text>
    <Controller
      control={control}
      render={({ onChange, onBlur, value }) => (
        <ATextInput
          autoFocus={autoFocus}
          error={_.get(errors, name)}
          keyboardType={keyboardType}
          onBlur={onBlur}
          onChangeText={value => {
            if (keyboardType === 'numeric') {
              const numbers = value.match(/\d+/g)

              if (numbers) {
                onChange(numbers.join(''))
              } else {
                onChange('')
              }
            } else {
              onChange(value)
            }
          }}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onSubmitEditing={onSubmitEditing}
          readOnly={readOnly}
          render={render}
          secureTextEntry={secureTextEntry}
          value={value !== null ? String(value) : ''}
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

export default MFormText
