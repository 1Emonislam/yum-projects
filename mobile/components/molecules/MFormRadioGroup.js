import { Controller } from 'react-hook-form'
import { required } from 'shared'
import { Text } from 'react-native-paper'
import { View } from 'react-native'
import AActivityIndicator from '@atoms/AActivityIndicator'
import AHelperText from '@atoms/AHelperText'
import ARadio from '@atoms/ARadio'
import ARadioGroup from '@atoms/ARadioGroup'
import MError from '@molecules/MError'
import React from 'react'

const MFormRadioGroup = ({
  control,
  defaultValue = '',
  errors,
  helperText,
  helperTextLong,
  items,
  label,
  name,
  readOnly,
  rules = { required: { value: true, message: required } },
}) => (
  <View style={{ paddingTop: 16 }}>
    <Text style={{ paddingBottom: helperTextLong ? 0 : 12 }}>{label}:</Text>
    {helperText && (
      <>
        {!helperTextLong && <AHelperText>{helperText}</AHelperText>}
        {helperTextLong && (
          <AHelperText style={{ lineHeight: 20 }}>{helperText}</AHelperText>
        )}
      </>
    )}
    <MError errors={errors} name={name} />
    <View style={{ marginLeft: -24, marginRight: -16 }}>
      {items && (
        <Controller
          control={control}
          render={({ onChange, value }) => (
            <ARadioGroup
              onValueChange={value => onChange(value)}
              value={typeof value === 'boolean' ? String(Number(value)) : value}
            >
              {items.map(item => (
                <ARadio
                  key={item.value}
                  value={
                    typeof value === 'boolean'
                      ? String(Number(item.value))
                      : item.value
                  }
                  disabled={readOnly}
                >
                  {item.label}
                </ARadio>
              ))}
            </ARadioGroup>
          )}
          name={name}
          defaultValue={defaultValue}
          rules={rules}
        />
      )}
      {typeof items === 'undefined' && (
        <View style={{ padding: 32 }}>
          <AActivityIndicator />
        </View>
      )}
    </View>
  </View>
)

export default MFormRadioGroup
