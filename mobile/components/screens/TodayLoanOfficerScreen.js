import {
  Caption,
  Dialog,
  List,
  Paragraph,
  Portal,
  Menu,
  Text,
} from 'react-native-paper'
import { Colors } from '@constants'
import { isPastMeeting } from '@utils'
import { ScrollView, View, useWindowDimensions } from 'react-native'
import {
  timezone,
  useAuth,
  useClientsByStatusAndLoanOfficerId,
  useUserProfile,
  useTodayClientGroups,
  useTodayRealizations,
} from 'shared'
import { useFocusEffect } from '@react-navigation/core'
import { useQueryClient } from 'react-query'
import AAction from '@atoms/AAction'
import AAppbar from '@atoms/AAppbar'
import AButton from '@atoms/AButton'
import AList from '@atoms/AList'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ASnackbar from '@atoms/ASnackbar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ATitle from '@atoms/ATitle'
import MAppVersion from '@molecules/MAppVersion'
import MUpdateBanner from '@molecules/MUpdateBanner'
import moment from 'moment-timezone'
import numeral from 'numeral'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

export function TodayLoanOfficerScreen({ navigation, route }) {
  const [visible, setVisible] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [forceCheckForUpdate, setForceCheckForUpdate] = useState(false)

  const queryClient = useQueryClient()

  const showDialog = () => setVisible(true)
  const hideDialog = () => setVisible(false)

  const [drafts, setDrafts] = useState([])

  const [snackbar, setSnackbar] = useState(false)
  const [snackbarText, setSnackbarText] = useState()

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries('todayClientGroups')
      queryClient.invalidateQueries('todayRealizations')
      queryClient.invalidateQueries('clientsByStatusAndLoanOfficerId')
    }, [queryClient])
  )

  useEffect(() => {
    if (route.params) {
      const { snackbar } = route.params

      if (snackbar) {
        setSnackbar(true)
        setSnackbarText(snackbar)
      }
    }
  }, [route.params])

  const { _id: loanOfficerId, logOut } = useAuth()

  const { firstName } = useUserProfile()

  const {
    data: todayClientGroups = [],
    isFetching: todayClientGroupsFetching,
  } = useTodayClientGroups()

  const {
    data: todayRealizations = {},
    isFetching: todayRealizationsFetching,
  } = useTodayRealizations()

  const { isFetching: clientsToSurveyFetching, data: clientsToSurvey = [] } =
    useClientsByStatusAndLoanOfficerId({
      status: 'toSurvey',
      loanOfficerId,
    })

  useEffect(() => {
    const getDrafts = async () => {
      let keys = []

      try {
        keys = await AsyncStorage.getAllKeys()
      } catch (e) {
        console.error(e)
      }

      setDrafts(
        keys
          .filter(key => String(key).startsWith('loanApplication'))
          .map(key => key.replace('loanApplication', ''))
      )
    }

    getDrafts()
  }, [clientsToSurveyFetching])

  const renderClientToSurvey = useCallback(
    ({ item: client }) => {
      return (
        <List.Item
          key={client._id}
          title={`${client.lastName}, ${client.firstName}`}
          description={
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: -4,
              }}
            >
              {drafts.includes(String(client._id)) && (
                <Text
                  style={{
                    color: Colors.green,
                    width: width - 32,
                  }}
                >
                  Draft
                </Text>
              )}
              <Text
                style={{
                  color: Colors.placeholder,
                  width: width - 32,
                  lineHeight: 20,
                }}
              >
                {client?.admission.address}
              </Text>
            </View>
          }
          onPress={() =>
            navigation.navigate('Form: Loan Application', {
              clientProfile: true,
              draft: drafts.includes(String(client._id)),
              client,
            })
          }
        />
      )
    },
    [navigation, clientsToSurvey, drafts]
  )

  const renderTodayClientGroupMeeting = useCallback(
    ({ item: clientGroup, index }) => {
      return (
        <List.Item
          key={index}
          title={clientGroup.name}
          description={
            String(clientGroup.meeting.address).trim() ||
            'Please add an address'
          }
          left={() => (
            <Caption
              style={{
                paddingLeft: 8,
                paddingTop: 4,
                width: 48,
                color: isPastMeeting(clientGroup.meeting)
                  ? Colors.placeholder
                  : Colors.green,
              }}
            >
              {String(clientGroup.meeting.time).trim().padStart(5, '0')}
            </Caption>
          )}
          onPress={() =>
            navigation.navigate('Meeting', {
              clientGroupId: clientGroup._id,
            })
          }
        />
      )
    },
    [navigation]
  )

  const renderStats = useCallback(stats => {
    return (
      <>
        <List.Item
          title="Today’s target"
          right={() => (
            <Text style={{ fontSize: 16, paddingTop: 6, paddingRight: 6 }}>
              {`USh ${numeral(parseInt(stats.installment)).format('0,0')}`}
            </Text>
          )}
        />
        <List.Item
          title="Today’s target + Overdue"
          right={() => (
            <Text style={{ fontSize: 16, paddingTop: 6, paddingRight: 6 }}>
              {`USh ${numeral(
                parseInt(stats.overdue) + parseInt(stats.installment)
              ).format('0,0')}`}
            </Text>
          )}
        />
        <List.Item
          title="Today’s realization so far"
          right={() => (
            <Text style={{ fontSize: 16, paddingTop: 6, paddingRight: 6 }}>
              {`USh ${numeral(parseInt(stats.todaysRealization)).format(
                '0,0'
              )}`}
            </Text>
          )}
        />
      </>
    )
  }, [])

  const renderTodayRealization = useCallback(() => {
    const hasNoClientGroups =
      todayClientGroups && todayClientGroups.length === 0
    if (todayRealizationsFetching || hasNoClientGroups) {
      return null
    }

    if (!todayRealizations?.total) {
      return null
    }

    return renderStats(todayRealizations?.total)
  }, [
    renderStats,
    todayClientGroups,
    todayRealizations.total,
    todayRealizationsFetching,
  ])

  const sortedGroups = useMemo(() => {
    return todayClientGroups
      .filter(
        clientGroup =>
          clientGroup.meeting.dayOfWeek === moment().tz(timezone).isoWeekday()
      )
      .sort((a, b) => {
        const aTime = parseInt(a.meeting.time)
        const bTime = parseInt(b.meeting.time)

        return aTime - bTime
      })
  }, [todayClientGroups])

  const width = useWindowDimensions().width

  return (
    <ASafeAreaView>
      <AAppbar
        title={`Hello${firstName ? `, ${firstName}` : ''}`}
        back={false}
        navigation={navigation}
      >
        <Menu
          visible={showMenu}
          onDismiss={() => setShowMenu(false)}
          anchor={
            <AAction icon="more-vert" onPress={() => setShowMenu(true)} />
          }
        >
          <Menu.Item
            onPress={() => {
              setShowMenu(false)
              navigation.navigate('Change password')
            }}
            title="Change password"
            titleStyle={{ fontSize: 14 }}
          />
          <Menu.Item
            onPress={() => {
              setShowMenu(false)
              showDialog()
            }}
            title="Sign out"
            titleStyle={{ fontSize: 14 }}
          />
        </Menu>
      </AAppbar>
      <MUpdateBanner
        onForceCheckForUpdate={() => setForceCheckForUpdate(false)}
        forceCheckForUpdate={forceCheckForUpdate}
      />
      <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
        <View>
          <MAppVersion
            onForceCheckForUpdate={() => setForceCheckForUpdate(true)}
            forceCheckForUpdateInProgress={forceCheckForUpdate}
          />
          <View style={{ padding: 16, paddingBottom: 0 }}>
            <ATitle>Meetings</ATitle>
          </View>
          <List.Section>
            {renderTodayRealization()}
            <AList
              noFlatList
              data={sortedGroups}
              emptyStateText="No meetings scheduled for today"
              renderItem={renderTodayClientGroupMeeting}
              isFetching={
                todayClientGroupsFetching || todayRealizationsFetching
              }
            />
          </List.Section>
          <View style={{ padding: 16, paddingBottom: 0 }}>
            <ATitle>Clients to survey</ATitle>
          </View>
          <List.Section>
            <AList
              noFlatList
              data={clientsToSurvey}
              emptyStateText="No clients to survey"
              renderItem={renderClientToSurvey}
              isFetching={clientsToSurveyFetching}
            />
          </List.Section>
        </View>
      </ScrollView>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Content>
            <Paragraph>Are you sure you want to sign out?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <AButton onPress={hideDialog}>No</AButton>
            <AButton onPress={() => logOut()}>Yes, I’m sure</AButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Portal>
        <ASnackbar
          visible={snackbar}
          duration={1000}
          onDismiss={() => {
            setSnackbar(false)
            setSnackbarText(null)
          }}
          style={{ marginBottom: 64 }}
        >
          {snackbarText}
        </ASnackbar>
      </Portal>
    </ASafeAreaView>
  )
}

export default TodayLoanOfficerScreen
