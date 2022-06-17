import { Caption, Text } from 'react-native-paper'
import { Colors } from '@constants'
import { getColorByStatus } from '@utils'
import { View } from 'react-native'
import React from 'react'

const MField = ({ label, detail, children }) => (
  <View style={{ width: '50%', paddingBottom: 16 }}>
    <Text
      style={{
        fontSize: 14,
        fontFamily: 'sans-serif-medium',
        color: Colors.placeholder,
      }}
    >
      {label}
    </Text>
    <View
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
    >
      {(label === 'Status' || label === 'Passbook') && (
        <View
          style={{
            width: 14,
            height: 14,
            backgroundColor: getColorByStatus(String(children)),
            marginRight: 4,
          }}
        />
      )}
      <Text
        style={{
          fontSize: 16,
          color:
            label === 'Status' || label === 'Passbook'
              ? getColorByStatus(String(children), true)
              : Colors.black,
        }}
      >
        {children}
      </Text>
    </View>
    {detail && <Caption style={{ marginTop: -1 }}>{detail}</Caption>}
  </View>
)

export default MField
