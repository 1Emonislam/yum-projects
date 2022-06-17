import { Colors } from '@constants'
import { Controller } from 'react-hook-form'
import { IconButton, Text, TouchableRipple } from 'react-native-paper'
import { required } from 'shared'
import { View } from 'react-native'
import MError from '@molecules/MError'
import React from 'react'

const MFormPhoto = ({
  context,
  control,
  defaultValue = '',
  errors,
  label,
  name,
  navigation,
  readOnly,
  rules = { required: { value: true, message: required } },
  screen,
  confirmation,
  take = 'Take a photo',
  taken = 'Photo taken',
}) => (
  <View style={{ paddingTop: label !== false ? 16 : 0 }}>
    {label !== false && <Text style={{ paddingBottom: 12 }}>{label}:</Text>}
    <MError errors={errors} name={name} />
    <View style={{ marginLeft: -24, marginRight: -24 }}>
      <Controller
        control={control}
        render={({ value }) => (
          <TouchableRipple
            onPress={() => {
              navigation.navigate('Photo', {
                label: label,
                context: context,
                screen,
                name,
                confirmation,
                photo: value.uri,
                readOnly,
              })
            }}
          >
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
            >
              <IconButton
                icon="photo-camera"
                color={value?.uri ? Colors.green : Colors.placeholder}
                style={{ margin: 0, padding: 0 }}
              />
              <Text style={{ flexGrow: 1 }}>{value?.uri ? taken : take}</Text>
            </View>
          </TouchableRipple>
        )}
        name={name}
        defaultValue={defaultValue}
        rules={rules}
      />
    </View>
  </View>
)

export default MFormPhoto
