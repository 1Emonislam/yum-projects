import { List } from 'react-native-paper'
import React from 'react'

const MLoanSignature = ({ name, navigation, signature, readOnly }) => (
  <List.Item
    title={name}
    onPress={() => {
      const isFingerprint =
        signature !== '' && String(signature).startsWith('https://')

      const params = isFingerprint
        ? {
            label: name,
            fingerprint: true,
            photo: signature,
            readOnly,
          }
        : {
            label: name,
            signature,
            readOnly,
          }

      navigation.navigate(isFingerprint ? 'Photo' : 'Signature', params)
    }}
  />
)

export default MLoanSignature
