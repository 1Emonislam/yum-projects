import React from 'react'
import { View, TextInput } from 'react-native'
import { Text } from 'react-native-paper'
import ATextInput from '@atoms/ATextInput'

const MCurrencyInput = props => (
  <ATextInput
    keyboardType="numeric"
    render={({ style, ...props }) => (
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Text
          style={{
            fontSize: 16,
            paddingLeft: 14,
            paddingTop: 7,
          }}
        >
          USh
        </Text>
        <TextInput
          style={{
            flexGrow: 1,
            fontSize: 16,
            padding: 0,
            paddingLeft: 14,
            paddingTop: 4,
          }}
          {...props}
        />
      </View>
    )}
    {...props}
  />
)

export default MCurrencyInput
