import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import ASafeAreaView from '@atoms/ASafeAreaView'
import AButton from '@atoms/AButton'
import ATextInput from '@atoms/ATextInput'
import { Colors } from '@constants'
import { useMeetingLogic } from 'shared'

export function MeetingRequestsScreen({ navigation, route }) {
  const clientGroupId = route?.params?.clientGroupId
  const [todayMeeting, mutate, isLoading] = useMeetingLogic(clientGroupId)
  const [requests, setRequests] = useState('')

  useEffect(() => {
    setRequests(todayMeeting?.requests)
  }, [todayMeeting?.requests])

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
            value={requests}
            onChangeText={value => setRequests(value)}
          />
          <View style={{ paddingTop: 16 }}>
            <AButton
              mode="contained"
              onPress={() => {
                mutate({
                  requests,
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

export default MeetingRequestsScreen
