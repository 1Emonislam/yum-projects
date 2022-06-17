import React from 'react'
import { View, TextInput } from 'react-native'
import { List, Text } from 'react-native-paper'
import ATextInput from '@atoms/ATextInput'

const MListItemCurrency = ({ title, value, onChangeText }) => (
  <List.Item
    title={
      <View
        style={{
          paddingTop: 4,
        }}
      >
        <Text style={{ fontSize: 16 }}>{title}:</Text>
      </View>
    }
    right={() => (
      <ATextInput
        style={{ width: '50%' }}
        keyboardType="numeric"
        textAlign="right"
        render={props => (
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                paddingLeft: 12,
                paddingTop: 7,
              }}
            >
              USh
            </Text>
            <TextInput
              {...props}
              style={{
                flexGrow: 1,
                fontSize: 16,
                padding: 0,
                paddingRight: 6,
                height: 35,
              }}
              value={value}
              onChangeText={onChangeText}
            />
          </View>
        )}
      />
    )}
  />
)

export default MListItemCurrency
