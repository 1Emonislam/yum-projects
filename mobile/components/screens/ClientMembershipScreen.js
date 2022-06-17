import { useQueryClient } from 'react-query'
import omit from 'lodash/omit'
import AButtonWithLoader from '@atoms/AButtonWithLoader'
import ASafeAreaView from '@atoms/ASafeAreaView'
import { Colors } from '@constants'
import moment from 'moment'
import React, { useCallback, useMemo, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { List, Text, Switch } from 'react-native-paper'
import { useClientById, useInsertEvent } from 'shared'

export function ClientMembershipScreen({ navigation, route }) {
  const queryClient = useQueryClient()
  const clientId = route?.params?.clientId
  const [isSwitchOn, setIsSwitchOn] = useState(false)
  const { mutate, isLoading: isSubmitting } = useInsertEvent()

  const handleRenew = useCallback(async () => {
    await mutate(
      {
        type: 'update',
        obj: 'client',
        _id: client._id,
        lastRenewalAt: new Date(),
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['clientById', client._id])
          navigation.goBack()
        },
      }
    )
  }, [client, mutate, navigation, queryClient])

  const { data: client } = useClientById(clientId)

  const membershipStatus = useMemo(() => {
    let status = 'Inactive'

    if (
      client.lastRenewalAt &&
      moment(client.lastRenewalAt).add('1', 'year').isAfter(moment())
    ) {
      status = 'Active'
    } else {
      if (
        client.addedAt &&
        moment(client.addedAt).add('1', 'year').isAfter(moment())
      ) {
        status = 'Active'
      }
    }

    return status
  }, [client])

  return (
    <ASafeAreaView>
      <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
        <List.Section>
          <List.Item
            title="Membership status:"
            right={() => (
              <Text
                style={{
                  fontSize: 16,
                  paddingTop: 6,
                  paddingRight: 6,
                }}
              >
                {membershipStatus}
              </Text>
            )}
          />
          {client?.admissionAt && (
            <List.Item
              title="Admission date:"
              right={() => (
                <Text style={{ fontSize: 16, paddingTop: 6, paddingRight: 6 }}>
                  {moment(client.admissionAt).format('D MMMM YYYY')}
                </Text>
              )}
            />
          )}
          <List.Item
            title="Last renewal date:"
            right={() => (
              <Text style={{ fontSize: 16, paddingTop: 6, paddingRight: 6 }}>
                {moment(
                  client?.lastRenewalAt ||
                    client?.admissionAt ||
                    client?.addedAt
                ).format('D MMMM YYYY')}
              </Text>
            )}
          />
          <List.Item
            title="Price:"
            right={() => (
              <Text style={{ fontSize: 16, paddingTop: 6, paddingRight: 6 }}>
                USh 1,000
              </Text>
            )}
          />
          <List.Item
            title="Paid:"
            right={() => (
              <Switch
                value={isSwitchOn}
                onValueChange={() => setIsSwitchOn(!isSwitchOn)}
                color={Colors.green}
              />
            )}
          />
        </List.Section>
        <View style={{ paddingHorizontal: 16 }}>
          <AButtonWithLoader
            mode="contained"
            disabled={!isSwitchOn}
            onPress={handleRenew}
            loading={isSubmitting}
          >
            Renew
          </AButtonWithLoader>
        </View>
      </ScrollView>
    </ASafeAreaView>
  )
}

export default ClientMembershipScreen
