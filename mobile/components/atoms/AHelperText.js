import React from 'react'
import { View } from 'react-native'
import { HelperText } from 'react-native-paper'
import { MaterialIcons } from '@expo/vector-icons'
import { Colors } from '@constants'

const AHelperText = ({ children, error, ...props }) => (
  <View
    style={{
      paddingRight: 16,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    }}
  >
    {error && (
      <MaterialIcons
        name="error"
        size={16}
        color={Colors.red}
        style={{ marginRight: 4 }}
      />
    )}
    <HelperText padding="none" type={error ? 'error' : ''} {...props}>
      {children}
    </HelperText>
  </View>
)

export default AHelperText
