import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import ASafeAreaView from '@atoms/ASafeAreaView'
import AButton from '@atoms/AButton'
import ATextInput from '@atoms/ATextInput'
import { Colors } from '@constants'
import { useMeetingLogic } from 'shared'

export function MeetingNotesScreen({ navigation, route }) {
  const clientGroupId = route?.params?.clientGroupId
  const [todayMeeting, mutate, isLoading] = useMeetingLogic(clientGroupId)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setNotes(todayMeeting?.notes)
  }, [todayMeeting?.notes])

  return (
    <ASafeAreaView>
      <View style={{ backgroundColor: Colors.white, flexGrow: 1, flex: 1 }}>
        <View
          style={{
            paddingTop: 16,
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 20,
          }}
        >
          <ATextInput
            disabled={isLoading}
            autoFocus
            multiline
            numberOfLines={1}
            value={notes}
            onChangeText={value => setNotes(value)}
          />
          <View style={{ paddingTop: 16 }}>
            <AButton
              mode="contained"
              onPress={() => {
                mutate({
                  notes,
                })
                navigation.goBack()
              }}
            >
              Save
            </AButton>
          </View>
        </View>
      </View>
    </ASafeAreaView>
  )
}

export default MeetingNotesScreen
