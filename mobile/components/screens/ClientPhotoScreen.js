import React from 'react'
import ASafeAreaView from '@atoms/ASafeAreaView'
import { Colors } from '@constants'
import { useHeader } from '@hooks'
import { Image, ScrollView, useWindowDimensions } from 'react-native'
import { useClientById } from 'shared'

export function ClientPhotoScreen({ route }) {
  const clientId = route?.params?.clientId
  const width = useWindowDimensions().width
  const { data: client } = useClientById(clientId)

  useHeader({
    title: `${client.lastName}, ${client.firstName}`,
  })

  return (
    <ASafeAreaView>
      <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
        <Image
          style={{
            width: width,
            height: width,
          }}
          source={{
            uri: client.photo,
          }}
        />
      </ScrollView>
    </ASafeAreaView>
  )
}

export default ClientPhotoScreen
