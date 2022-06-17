import { Colors } from '@constants'
import { Dialog, Paragraph, Portal } from 'react-native-paper'
import { View } from 'react-native'
import AButton from '@atoms/AButton'
import React from 'react'

const MDraftErrorDialog = ({ visible, onDismiss }) => (
  <Portal>
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title style={{ color: Colors.red }}>
        Draft could not be saved
      </Dialog.Title>
      <Dialog.Content>
        <Paragraph style={{ fontFamily: 'sans-serif-medium', marginBottom: 8 }}>
          No storage space available on the phone.
        </Paragraph>
        <Paragraph>
          Please free up some storage space by deleting an app, a photo, or a
          file, and try again.
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

export default MDraftErrorDialog
