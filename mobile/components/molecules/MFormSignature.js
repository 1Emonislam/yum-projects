import { Colors } from '@constants'
import { Controller } from 'react-hook-form'
import { IconButton, Text, TouchableRipple } from 'react-native-paper'
import { required } from 'shared'
import { View } from 'react-native'
import MError from '@molecules/MError'
import React from 'react'

const MFormSignature = ({
  context,
  control,
  defaultValue = '',
  errors,
  fingerprint,
  label,
  name,
  navigation,
  readOnly,
  rules = { required: { value: true, message: required } },
  screen,
  sign = 'Sign',
  signed = 'Signed',
}) => (
  <View style={{ paddingTop: 16 }}>
    <Text style={{ paddingBottom: 12 }}>{label}:</Text>
    <MError errors={errors} name={name} />
    <View style={{ marginLeft: -24, marginRight: -24 }}>
      <Controller
        control={control}
        render={({ value }) => {
          const isFingerprint =
            value !== '' && String(value).startsWith('https://')

          const params = isFingerprint
            ? {
                label,
                context,
                screen,
                name,
                readOnly,
                fingerprint: true,
                confirmation: 'Is this fingerprint photo sharp?',
                photo: value,
              }
            : {
                label,
                context,
                screen,
                name,
                readOnly,
                signature: value,
              }

          return (
            <View>
              {value !== '' && (
                <TouchableRipple
                  onPress={() => {
                    navigation.navigate(
                      isFingerprint ? 'Photo' : 'Signature',
                      params
                    )
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
                      icon="edit"
                      color={Colors.green}
                      style={{ margin: 0, padding: 0 }}
                    />
                    <Text style={{ flexGrow: 1 }}>{signed}</Text>
                  </View>
                </TouchableRipple>
              )}
              {!value && (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: fingerprint ? 'row' : 'column',
                  }}
                >
                  <TouchableRipple
                    onPress={() => {
                      navigation.navigate('Signature', {
                        label,
                        context,
                        screen,
                        name,
                        signature: value,
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
                        icon="edit"
                        color={Colors.placeholder}
                        style={{ margin: 0, padding: 0 }}
                      />
                      <Text style={{ flexGrow: 1 }}>{sign}</Text>
                    </View>
                  </TouchableRipple>
                  {fingerprint && (
                    <View
                      style={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.placeholder,
                          paddingHorizontal: 16,
                        }}
                      >
                        or
                      </Text>
                      <TouchableRipple
                        onPress={() =>
                          navigation.navigate('Photo', {
                            label,
                            context,
                            screen,
                            name,
                            fingerprint: true,
                            confirmation: 'Is this fingerprint photo sharp?',
                          })
                        }
                      >
                        <View
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 8,
                            paddingRight: 16,
                            paddingLeft: 8,
                          }}
                        >
                          <IconButton
                            icon="fingerprint"
                            color={Colors.placeholder}
                            style={{ margin: 0, padding: 0 }}
                          />
                          <Text style={{ flexGrow: 1 }}>
                            Take a fingerprint
                          </Text>
                        </View>
                      </TouchableRipple>
                    </View>
                  )}
                </View>
              )}
            </View>
          )
        }}
        name={name}
        rules={rules}
        defaultValue={defaultValue}
      />
    </View>
  </View>
)

export default MFormSignature
