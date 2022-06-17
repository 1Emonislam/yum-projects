import { Colors } from '@constants'
import { Dialog, Paragraph, Portal } from 'react-native-paper'
import { View } from 'react-native'
import AButton from '@atoms/AButton'
import React from 'react'

const MLocationErrorDialog = ({ visible, onDismiss }) => (
  <Portal>
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title style={{ color: Colors.red }}>
        Location permission missing
      </Dialog.Title>
      <Dialog.Content>
        <Paragraph style={{ fontFamily: 'sans-serif-medium', marginBottom: 8 }}>
          Please go to the app settings and turn on location access for Yam.
        </Paragraph>
        <Paragraph>
          You will not be able to send the form without the location.
        </Paragraph>
      </Dialog.Content>
      <Dialog.Actions>
        <View>
          <AButton onPress={onDismiss}>OK</AButton>
        </View>
      </Dialog.Actions>
    </Dialog>
  </Portal>
)

export default MLocationErrorDialog
