import { Colors } from '@constants'
import { Divider, List, Text } from 'react-native-paper'
import { getColorByStatus } from '@utils'
import {
  getClientRole,
  useAuth,
  useInsertEvent,
  useClientGroupWithStats,
  useClientsByClientGroupId,
} from 'shared'
import { useHeader } from '@hooks'
import { useQueryClient } from 'react-query'
import { View, ScrollView } from 'react-native'
import AList from '@atoms/AList'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ATitle from '@atoms/ATitle'
import capitalize from 'lodash/capitalize'
import MField from '@molecules/MField'
import moment from 'moment'
import numeral from 'numeral'
import React, { useCallback, useMemo, useRef } from 'react'

export function ClientGroupScreen({ navigation, route }) {
  const clientGroupId = route?.params?.clientGroupId

  const { data: clientGroup = null } = useClientGroupWithStats(clientGroupId)

  const { data: { clients = [] } = {} } =
    useClientsByClientGroupId(clientGroupId)

  const queryClient = useQueryClient()

  const { mutate } = useInsertEvent({
    onMutate: async () => {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true })

      await queryClient.cancelQueries(['clientGroupWithStats', clientGroupId])

      const previousClientGroup = queryClient.getQueryData([
        'clientGroupWithStats',
        clientGroupId,
      ])

      queryClient.setQueryData(['clientGroupWithStats', clientGroupId], old => {
        return {
          ...old,
          status:
            previousClientGroup.status === 'draft' ||
            previousClientGroup.status === 'rejected'
              ? 'pending'
              : clientGroup.wasRejected
              ? 'rejected'
              : 'draft',
        }
      })

      return { previousClientGroup }
    },
  })

  const toggleSubmitForApproval = () => {
    mutate({
      type: 'update',
      obj: 'clientGroup',
      _id: clientGroupId,
      status:
        clientGroup?.status === 'pending'
          ? clientGroup?.wasRejected
            ? 'rejected'
            : 'draft'
          : 'pending',
    })
  }

  const { isBranchManager, isLoanOfficer } = useAuth()

  const activeClients = useMemo(() => {
    return clients.filter(
      client =>
        client.status.toLowerCase() === 'active' ||
        client.status.toLowerCase() === 'tosurvey'
    ).length
  }, [clients])

  const registeredClients = useMemo(() => clients.length, [clients])

  useHeader({
    title: clientGroup?.name ?? 'Loading…',
  })

  const scrollViewRef = useRef()

  const renderClient = useCallback(
    ({ item }) => {
      const clientId = item._id

      const clientRole = getClientRole(clientId, clientGroup)

      return (
        <List.Item
          key={`item-${clientId}`}
          title={`${item.lastName}, ${item.firstName}`}
          description={
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: -4,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  // borderRadius: 14,
                  backgroundColor: getColorByStatus(item.status),
                  marginRight: 4,
                  marginTop: 1,
                }}
              />
              <Text style={{ color: getColorByStatus(item.status, true) }}>
                {capitalize(item.status).replace('Tosurvey', 'To survey')}
              </Text>
              {clientRole !== 'Member' && (
                <Text style={{ color: Colors.placeholder }}>
                  {' '}
                  · {clientRole}
                </Text>
              )}
            </View>
          }
          onPress={() => navigation.navigate('Client', { clientId })}
        />
      )
    },
    [navigation, clientGroup]
  )

  if (clientGroup === null) {
    return null
  }

  const shouldShowApprovalRelatedItem =
    isLoanOfficer &&
    (clientGroup?.status === 'draft' ||
      clientGroup?.status === 'pending' ||
      clientGroup?.status === 'rejected')

  const shouldShowEditGroup =
    isBranchManager ||
    (isLoanOfficer && ['draft', 'pending'].includes(clientGroup?.status))

  return (
    <ASafeAreaView>
      <ScrollView
        style={{ backgroundColor: Colors.white, flex: 1 }}
        ref={scrollViewRef}
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: 16,
            paddingBottom: 0,
          }}
        >
          <MField label="Status">{capitalize(clientGroup.status)}</MField>
          <MField label="Code">{clientGroup.code}</MField>
          <MField label="Active clients">{activeClients}</MField>
          <MField label="Registered clients">{registeredClients}</MField>
          <MField label="Loans outstanding">
            USh {numeral(clientGroup.loansOutstanding).format('0,0')}
          </MField>
          <MField label="Security balance">
            USh {numeral(clientGroup.securityBalance).format('0,0')}
          </MField>
          <MField label="Meeting frequency">
            {capitalize(clientGroup.meeting.frequency)}
          </MField>
          <MField label="Loan Officer">
            {clientGroup.loanOfficer
              ? `${clientGroup.loanOfficer.lastName}, ${clientGroup.loanOfficer.firstName}`
              : 'Demo, Version'}
          </MField>
        </View>
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              color: Colors.placeholder,
              fontFamily: 'sans-serif-medium',
            }}
          >
            Meeting time:
          </Text>
          <Text style={{ fontSize: 16 }}>
            Every {clientGroup.meeting.frequency === 'monthly' ? 'first ' : ''}
            {clientGroup.meeting.frequency === 'biweekly' ? 'other ' : ''}
            {moment().isoWeekday(clientGroup.meeting.dayOfWeek).format('dddd')}
            {clientGroup.meeting.frequency === 'monthly' ? ' of the month' : ''}
            , {clientGroup.meeting.time}
          </Text>
        </View>
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              color: Colors.placeholder,
              fontFamily: 'sans-serif-medium',
            }}
          >
            Meeting place:
          </Text>
          <Text style={{ fontSize: 16 }}>{clientGroup.meeting.address}</Text>
        </View>
        <Divider />
        <View style={{ paddingLeft: 16, paddingTop: 16, paddingBottom: 0 }}>
          <ATitle>Clients</ATitle>
        </View>
        <List.Section>
          <AList
            noFlatList
            emptyStateText="No clients"
            data={clients}
            renderItem={renderClient}
          />
        </List.Section>
        {(shouldShowApprovalRelatedItem || shouldShowEditGroup) && (
          <View>
            <Divider />
            <View style={{ paddingLeft: 16, paddingTop: 16 }}>
              <ATitle>Actions</ATitle>
            </View>
            <List.Section>
              {shouldShowApprovalRelatedItem && (
                <List.Item
                  title={
                    clientGroup?.status === 'draft' ||
                    clientGroup?.status === 'rejected'
                      ? 'Request approval'
                      : 'Cancel approval request'
                  }
                  onPress={toggleSubmitForApproval}
                />
              )}
              {shouldShowEditGroup && (
                <List.Item
                  title="Edit group"
                  onPress={() =>
                    navigation.navigate('Client Group: Edit', { clientGroupId })
                  }
                />
              )}
            </List.Section>
          </View>
        )}
      </ScrollView>
    </ASafeAreaView>
  )
}

export default ClientGroupScreen
