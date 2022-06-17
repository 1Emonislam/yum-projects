import React, { useMemo } from 'react'
import { ScrollView, View } from 'react-native'
import { Checkbox, IconButton, List, Text } from 'react-native-paper'
import ASafeAreaView from '@atoms/ASafeAreaView'
import AActivityIndicator from '@atoms/AActivityIndicator'
import { Colors } from '@constants'
import { useMeetingLogic } from 'shared'
import { useHeader } from '@hooks'

export function MeetingAttendanceScreen({ route }) {
  const clientGroupId = route?.params?.clientGroupId
  const [todayMeeting, mutate, isLoading] = useMeetingLogic(clientGroupId)

  const { total, present } = useMemo(() => {
    const total = todayMeeting?.attendance?.length ?? 0
    const present =
      todayMeeting?.attendance?.filter(
        item => item?.attended || item?.representative
      ).length ?? 0

    return {
      total,
      present,
    }
  }, [todayMeeting])

  useHeader({
    subtitle: `Confirmed ${present} out of ${total} clients`,
  })

  return (
    <ASafeAreaView style={{ backgroundColor: Colors.white, flex: 1 }}>
      {todayMeeting === null && isLoading ? (
        <AActivityIndicator />
      ) : (
        <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
          <View>
            <Text style={{ margin: 16, marginBottom: 0 }}>
              Please also check the people icon if representative person is
              present.
            </Text>
          </View>
          <List.Section>
            {todayMeeting?.attendance?.map(client => {
              const id = client.clientId
              return (
                <List.Item
                  key={id}
                  title={`${client.lastName}, ${client.firstName}`}
                  left={() => (
                    <Checkbox
                      status={client.attended ? 'checked' : 'unchecked'}
                      color={Colors.green}
                      disabled={isLoading}
                      onPress={() => {
                        mutate({
                          attendance: todayMeeting?.attendance?.map(a => {
                            if (id === a.clientId) {
                              return {
                                ...a,
                                attended: !a.attended,
                              }
                            }

                            return a
                          }),
                        })
                      }}
                    />
                  )}
                  right={() => (
                    <View style={{ marginTop: -8, marginBottom: -8 }}>
                      <IconButton
                        icon={
                          client.representative ? 'people' : 'people-outline'
                        }
                        size={24}
                        disabled={isLoading}
                        onPress={() =>
                          mutate({
                            attendance: todayMeeting?.attendance?.map(a => {
                              if (id === a.clientId) {
                                return {
                                  ...a,
                                  representative: !a.representative,
                                }
                              }

                              return a
                            }),
                          })
                        }
                      />
                    </View>
                  )}
                />
              )
            })}
          </List.Section>
        </ScrollView>
      )}
    </ASafeAreaView>
  )
}

export default MeetingAttendanceScreen
