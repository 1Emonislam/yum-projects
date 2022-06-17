import { Colors } from '@constants'
import { List, Paragraph, Appbar } from 'react-native-paper'
import { useAuth, useSecureClientGroups } from 'shared'
import { useIsFocused } from '@react-navigation/native'
import { View } from 'react-native'
import AAppbar from '@atoms/AAppbar'
import AFabGroup from '@atoms/AFabGroup'
import AList from '@atoms/AList'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ATitle from '@atoms/ATitle'
import ClientsIcon from '@icons/ClientsIcon'
import React, { useCallback } from 'react'
import moment from 'moment-timezone'
import capitalize from 'lodash/capitalize'

export function ClientsScreen({ navigation }) {
  const { _id: userId, branchId, role, isLoanOfficer } = useAuth()

  const {
    isFetching,
    data: clientGroups,
    refetch,
  } = useSecureClientGroups({
    status: '',
    role,
    userId,
    branchId,
  })

  const isFocused = useIsFocused()

  const renderItem = useCallback(
    ({ item: group }) => {
      return (
        <List.Item
          title={group.name}
          description={`${group.code} · ${moment()
            .isoWeekday(group?.meeting?.dayOfWeek)
            .format('dddd')} · ${String(group?.meeting?.time)
            .replace('pm', '')
            .trim()} · ${capitalize(group?.meeting?.frequency)} ${
            group?.meeting?.address
              ? `· ${String(group?.meeting?.address).trim()}`
              : ''
          }`}
          onPress={() =>
            navigation.navigate('Client Group', { clientGroupId: group._id })
          }
          descriptionNumberOfLines={1}
        />
      )
    },
    [navigation]
  )

  const sortClientGroups = (a, b) => {
    const aa = Number(
      [
        a.meeting.dayOfWeek,
        String(a.meeting.time)
          .replace(':', '')
          .replace('pm', '')
          .trim()
          .padStart(4, '0'),
      ].join('')
    )

    const bb = Number(
      [
        b.meeting.dayOfWeek,
        String(b.meeting.time)
          .replace(':', '')
          .replace('pm', '')
          .trim()
          .padStart(4, '0'),
      ].join('')
    )

    if (aa < bb) {
      return -1
    }

    if (aa > bb) {
      return 1
    }

    if (aa == bb) {
      if (a.name > b.name) {
        return 1
      }

      if (a.name < b.name) {
        return -1
      }
    }

    return 0
  }

  const EmptyState = () => (
    <View
      style={{
        backgroundColor: Colors.white,
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ClientsIcon size={48} color={Colors.black} />
      <ATitle>Empty in client groups</ATitle>
      {isLoanOfficer && (
        <View style={{ display: 'flex', alignItems: 'center', paddingTop: 4 }}>
          <Paragraph>Tap the plus icon in the lower right corner,</Paragraph>
          <Paragraph>add a new group, and it will show up here</Paragraph>
        </View>
      )}
    </View>
  )

  return (
    <ASafeAreaView>
      <AAppbar title="Client groups" back={false} navigation={navigation} />
      <AList
        isFetching={isFetching}
        onRefresh={refetch}
        style={{
          backgroundColor: Colors.white,
          flex: 1,
        }}
        data={clientGroups?.sort(sortClientGroups)}
        renderItem={renderItem}
        emptyStateComponent={<EmptyState />}
      />
      {isLoanOfficer && (
        <AFabGroup
          icon="add"
          isFocused={isFocused}
          actions={[
            {
              icon: 'group',
              label: 'New group',
              color: Colors.green,
              onPress: () => navigation.navigate('Client Group: New'),
            },
            {
              icon: 'clients',
              label: 'New client',
              color: Colors.green,
              onPress: () => navigation.navigate('Client: New'),
            },
          ]}
          onPress={() => {}}
          style={{ paddingBottom: 56 }}
        />
      )}
    </ASafeAreaView>
  )
}

export default ClientsScreen
