import { Colors } from '@constants'
import { List } from 'react-native-paper'
import { ScrollView } from 'react-native'
import {
  getClientRole,
  useAuth,
  useClientGroupEditForm,
  useSecureClientsByClientGroupId,
} from 'shared'
import { useHeader } from 'hooks'
import ASafeAreaView from '@atoms/ASafeAreaView'
import React, { useState } from 'react'

export function ClientGroupEditRoleScreen({ navigation, route }) {
  const clientRole = route?.params?.role
  const clientGroup = route?.params?.clientGroup

  const { _id: userId, branchId, role } = useAuth()

  const [client, setClient] = useState(false)

  const { data: clients, isFetching } = useSecureClientsByClientGroupId({
    id: clientGroup._id,
    role,
    userId,
    branchId,
  })

  const updateRole = client => {
    navigation.navigate('Client Group: Edit', {
      clientGroupId: clientGroup._id,
      clientRole: {
        name: clientRole,
        clientId: client._id,
        clientName: `${client.lastName}, ${client.firstName}`,
      },
    })
  }

  const byRole = (a, b) => {
    const isAPresident = a._id === clientGroup?.president?._id
    const isASecretary = a._id === clientGroup?.secretary?._id
    const isACashier = a._id === clientGroup?.cashier?._id
    const isBPresident = b._id === clientGroup?.president?._id
    const isBSecretary = b._id === clientGroup?.secretary?._id
    const isBCashier = b._id === clientGroup?.cashier?._id

    if (isAPresident || isASecretary || isACashier || a.lastName < b.lastName) {
      return -1
    }

    if (isBPresident || isBSecretary || isBCashier || a.lastName > b.lastName) {
      return 1
    }

    return 0
  }

  useHeader({
    title: clientRole && !isFetching ? `Select the ${clientRole}` : 'Loading…',
  })

  return (
    <ASafeAreaView>
      <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
        {!isFetching && clients && (
          <List.Section>
            {clients.sort(byRole).map(client => {
              return (
                <List.Item
                  key={client._id}
                  title={`${client.lastName}, ${client.firstName}`}
                  description={getClientRole(client._id, clientGroup)}
                  onPress={() => updateRole(client)}
                />
              )
            })}
          </List.Section>
        )}
      </ScrollView>
    </ASafeAreaView>
  )
}

export default ClientGroupEditRoleScreen
