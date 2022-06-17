import { Colors } from '@constants'
import { Dialog, Paragraph, Portal } from 'react-native-paper'
import { View } from 'react-native'
import AButton from '@atoms/AButton'
import React from 'react'

const MGeneralErrorDialog = ({ visible, onDismiss }) => (
  <Portal>
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title style={{ color: Colors.red }}>Error</Dialog.Title>
      <Dialog.Content>
        <Paragraph>Something went wrong. Please try again later.</Paragraph>
      </Dialog.Content>
      <Dialog.Actions>
        <View>
          <AButton onPress={onDismiss}>OK</AButton>
        </View>
      </Dialog.Actions>
    </Dialog>
  </Portal>
)

export default MGeneralErrorDialog
