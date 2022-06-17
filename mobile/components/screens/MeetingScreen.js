import ASafeAreaView from '@atoms/ASafeAreaView'
import ATitle from '@atoms/ATitle'
import AActivityIndicator from '@atoms/AActivityIndicator'
import { Colors } from '@constants'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ScrollView, View } from 'react-native'
import {
  Appbar,
  Caption,
  Checkbox,
  List,
  Portal,
  Text,
} from 'react-native-paper'
import { useMeetingLogic } from 'shared'
import { useHeader } from '@hooks'
import numeral from 'numeral'
import ASnackbar from '../atoms/ASnackbar'

export function MeetingScreen({ navigation, route }) {
  const [snackbar, setSnackbar] = useState(false)
  const [snackbarText, setSnackbarText] = useState()

  const clientGroupId = route?.params?.clientGroupId
  const [todayMeeting, mutate, isLoading] = useMeetingLogic(clientGroupId)
  const total = todayMeeting?.attendance?.length
  const present =
    todayMeeting?.attendance?.filter(
      item => item?.attended || item?.representative
    ).length ?? 0

  const todaysRealizations =
    todayMeeting?.installments
      ?.map?.(installment => installment.todaysRealization ?? 0)
      ?.reduce((acc, value) => acc + value, 0) ?? 0
  const totalInstallments =
    todayMeeting?.installments
      ?.map?.(installment => installment.installment)
      ?.reduce((acc, value) => acc + value, 0) ?? 0
  const totalOverdue =
    todayMeeting?.installments
      ?.map?.(installment => installment.overdue)
      ?.reduce((acc, value) => acc + value, 0) ?? 0

  useEffect(() => {
    if (route.params) {
      const { snackbar = false, photo = {} } = route.params
      const photoUrl = photo?.value

      if (snackbar) {
        setSnackbar(true)
        setSnackbarText(snackbar)
      }

      if (
        photoUrl !== null &&
        photoUrl !== undefined &&
        typeof photoUrl === 'string'
      ) {
        mutate({
          photoUrl,
        })
      }
    }
  }, [route.params])

  useHeader({
    actions: (
      <Appbar.Action
        color={Colors.black}
        icon="group"
        onPress={() =>
          navigation.navigate('Client Group', {
            clientGroupId,
          })
        }
      />
    ),
  })

  const installmentsCollected = useMemo(() => {
    return (
      todayMeeting?.installments?.every?.(i => i.todaysRealization !== null) ??
      false
    )
  }, [todayMeeting])

  const renderInstallmentsDescription = useCallback(() => {
    if (todayMeeting?.installments?.length === 0 ?? true) {
      return 'No installments to collect'
    }

    const withoutOverdue = `USh ${numeral(todaysRealizations).format(
      '0,0'
    )} / USh ${numeral(totalInstallments).format('0,0')} (no overdue)`

    const withOverdue = `USh ${numeral(todaysRealizations).format(
      '0,0'
    )} / USh ${numeral(totalInstallments + totalOverdue).format(
      '0,0'
    )} (overdue)`

    return `${withoutOverdue}\n${withOverdue}`
  }, [
    todayMeeting?.installments?.length,
    todaysRealizations,
    totalInstallments,
    totalOverdue,
  ])

  return (
    <ASafeAreaView style={{ backgroundColor: Colors.white, flex: 1 }}>
      {todayMeeting === null && isLoading ? (
        <View style={{ paddingTop: 16 }}>
          <AActivityIndicator />
        </View>
      ) : (
        <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
          <View>
            <View style={{ padding: 16, paddingBottom: 0 }}>
              <ATitle>{todayMeeting?.clientGroup?.name}</ATitle>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  height: 22,
                }}
              >
                <Caption
                  style={{
                    color: Colors.green,
                    width: 40,
                  }}
                >
                  {todayMeeting?.clientGroup?.meeting?.time}
                </Caption>
                <Caption>{todayMeeting?.clientGroup?.meeting?.address}</Caption>
              </View>
            </View>
            <List.Section>
              <List.Item
                title="Start the meeting"
                left={() => (
                  <View
                    style={{ width: 52, display: 'flex', flexDirection: 'row' }}
                  >
                    <Text
                      style={{
                        paddingTop: 7,
                        paddingLeft: 8,
                        fontSize: 16,
                        color: Colors.placeholder,
                      }}
                    >
                      1.
                    </Text>
                    <Checkbox
                      status={todayMeeting?.startedAt ? 'checked' : 'unchecked'}
                      color={Colors.green}
                    />
                  </View>
                )}
                disabled={isLoading}
                onPress={() => {
                  mutate({
                    startedAt: todayMeeting?.startedAt ? null : new Date(),
                  })
                }}
              />
              <List.Item
                title="Take a photo"
                description="Remember to include all clients in the frame"
                left={() => (
                  <View
                    style={{ width: 52, display: 'flex', flexDirection: 'row' }}
                  >
                    <Text
                      style={{
                        paddingTop: 6,
                        paddingLeft: 8,
                        fontSize: 16,
                        color: Colors.placeholder,
                      }}
                    >
                      2.
                    </Text>
                    <Checkbox
                      status={todayMeeting?.photoUrl ? 'checked' : 'unchecked'}
                      color={Colors.green}
                    />
                  </View>
                )}
                disabled={isLoading}
                onPress={() => {
                  navigation.navigate('Photo', {
                    label: 'Photo of the meeting group',
                    context: 'Meeting group',
                    screen: 'Meeting',
                    name: 'photo',
                    photo: todayMeeting?.photoUrl,
                  })
                }}
              />
              <List.Item
                title="Take attendance"
                description={`${present} of ${total} clients`}
                left={() => {
                  return (
                    <View
                      style={{
                        width: 52,
                        display: 'flex',
                        flexDirection: 'row',
                      }}
                    >
                      <Text
                        style={{
                          paddingTop: 6,
                          paddingLeft: 8,
                          fontSize: 16,
                          color: Colors.placeholder,
                        }}
                      >
                        3.
                      </Text>
                      <Checkbox
                        color={Colors.green}
                        status={present !== 0 ? 'checked' : 'unchecked'}
                      />
                    </View>
                  )
                }}
                disabled={isLoading}
                onPress={() => {
                  const clientGroupId = route?.params?.clientGroupId

                  navigation.navigate('Meeting: Take attendance', {
                    clientGroupId,
                  })
                }}
              />
              <List.Item
                title="Collect installments"
                description={renderInstallmentsDescription()}
                left={() => (
                  <View
                    style={{ width: 52, display: 'flex', flexDirection: 'row' }}
                  >
                    <Text
                      style={{
                        paddingTop: 6,
                        paddingLeft: 8,
                        fontSize: 16,
                        color: Colors.placeholder,
                      }}
                    >
                      4.
                    </Text>
                    <Checkbox
                      status={installmentsCollected ? 'checked' : 'unchecked'}
                      color={Colors.green}
                    />
                  </View>
                )}
                disabled={isLoading}
                onPress={() => {
                  if (todayMeeting?.installments?.length === 0 ?? true) {
                    return
                  }
                  navigation.navigate('Meeting: Collect installments', {
                    clientGroupId,
                  })
                }}
              />
              <List.Item
                title="Verify potential clients within the group"
                description="No potential clients today? Please tick anyway"
                left={() => (
                  <View
                    style={{ width: 52, display: 'flex', flexDirection: 'row' }}
                  >
                    <Text
                      style={{
                        paddingTop: 6,
                        paddingLeft: 8,
                        fontSize: 16,
                        color: Colors.placeholder,
                      }}
                    >
                      5.
                    </Text>
                    <Checkbox
                      status={
                        todayMeeting?.potentialClientsVerified
                          ? 'checked'
                          : 'unchecked'
                      }
                      color={Colors.green}
                    />
                  </View>
                )}
                disabled={isLoading}
                onPress={() => {
                  mutate({
                    potentialClientsVerified:
                      !todayMeeting.potentialClientsVerified,
                  })
                }}
              />
              <List.Item
                title="Document requests"
                description="Loans, membership withdrawals"
                left={() => (
                  <View
                    style={{ width: 52, display: 'flex', flexDirection: 'row' }}
                  >
                    <Text
                      style={{
                        paddingTop: 6,
                        paddingLeft: 8,
                        fontSize: 16,
                        color: Colors.placeholder,
                      }}
                    >
                      6.
                    </Text>
                    <Checkbox
                      status={todayMeeting?.requests ? 'checked' : 'unchecked'}
                      color={Colors.green}
                    />
                  </View>
                )}
                disabled={isLoading}
                onPress={() =>
                  navigation.navigate('Meeting: Document requests', {
                    clientGroupId,
                  })
                }
              />
              {/* <List.Item
                title="Add optional notes"
                left={() => (
                  <View
                    style={{ width: 52, display: 'flex', flexDirection: 'row' }}
                  >
                    <Text
                      style={{
                        paddingTop: 7,
                        paddingLeft: 8,
                        fontSize: 16,
                        color: Colors.placeholder,
                      }}
                    >
                      7.
                    </Text>
                    <Checkbox
                      status={
                        todayMeeting?.notes === '' || !todayMeeting?.notes
                          ? 'unchecked'
                          : 'checked'
                      }
                      color={Colors.green}
                    />
                  </View>
                )}
                disabled={isLoading}
                onPress={() =>
                  navigation.navigate('Meeting: Add optional notes', {
                    clientGroupId,
                  })
                }
              /> */}
              <List.Item
                title="End the meeting"
                left={() => (
                  <View
                    style={{ width: 52, display: 'flex', flexDirection: 'row' }}
                  >
                    <Text
                      style={{
                        paddingTop: 7,
                        paddingLeft: 8,
                        fontSize: 16,
                        color: Colors.placeholder,
                      }}
                    >
                      8.
                    </Text>
                    <Checkbox
                      status={todayMeeting?.endedAt ? 'checked' : 'unchecked'}
                      color={Colors.green}
                    />
                  </View>
                )}
                disabled={isLoading}
                onPress={() => {
                  mutate({
                    endedAt: todayMeeting?.endedAt ? null : new Date(),
                  })
                }}
              />
            </List.Section>
          </View>
        </ScrollView>
      )}
      <Portal>
        <ASnackbar
          visible={snackbar}
          duration={1000}
          onDismiss={() => {
            setSnackbar(false)
            setSnackbarText(null)
          }}
        >
          {snackbarText}
        </ASnackbar>
      </Portal>
    </ASafeAreaView>
  )
}

export default MeetingScreen
