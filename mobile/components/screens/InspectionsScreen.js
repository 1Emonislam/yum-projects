import { Colors } from '@constants'
import { List, Text } from 'react-native-paper'
import { ScrollView, View, useWindowDimensions } from 'react-native'
import { useAuth, useClientsInspections } from 'shared'
import AAction from '@atoms/AAction'
import AActivityIndicator from '@atoms/AActivityIndicator'
import ASafeAreaView from '@atoms/ASafeAreaView'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useMemo, useState } from 'react'
import { useHeader } from '@hooks'

export function InspectionsScreen({ route, navigation }) {
  const { _id } = useAuth()

  const {
    isLoading: isLoadingInspections,
    isFetching: isFetchingInspections,
    data: inspections,
  } = useClientsInspections()

  const [group, setGroup] = useState()

  const [drafts, setDrafts] = useState([])

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
          .filter(key => String(key).startsWith('clientInspection'))
          .map(key => key.replace('clientInspection', ''))
      )
    }

    getDrafts()
  }, [isFetchingInspections])

  useEffect(() => {
    if (route.params) {
      const { group } = route.params

      if (group) {
        setGroup(group)
      }
    }
  }, [route.params, setGroup])

  const forms = useMemo(() => {
    if (group && inspections) {
      const inspection = inspections.find(
        inspection => inspection._id === group._id
      )

      if (inspection) {
        return inspection.forms || []
      }
    }

    return []
  }, [group, inspections])

  useHeader({
    subtitle: group?.name,
    actions: <AAction icon="group" onPress={() => {}} />,
  })

  const width = useWindowDimensions().width

  return (
    <ASafeAreaView>
      <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
        {(isLoadingInspections || isFetchingInspections) && (
          <View style={{ padding: 16 }}>
            <AActivityIndicator />
          </View>
        )}
        {!isLoadingInspections &&
          !isFetchingInspections &&
          group &&
          inspections && (
            <List.Section>
              {forms.map(form => (
                <List.Item
                  key={form.client._id}
                  title={`${form.client.lastName}, ${form.client.firstName}`}
                  description={
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginTop: -4,
                      }}
                    >
                      {drafts.includes(String(form.client._id)) && (
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
                        {form.client.address}
                      </Text>
                    </View>
                  }
                  onPress={() =>
                    navigation.navigate('Form: Client Inspection', {
                      clientProfile: true,
                      client: form.client,
                      loanApplicationFormId: form.form._id,
                      draft: drafts.includes(String(form.client._id)),
                      group,
                    })
                  }
                />
              ))}
            </List.Section>
          )}
      </ScrollView>
    </ASafeAreaView>
  )
}

export default InspectionsScreen
