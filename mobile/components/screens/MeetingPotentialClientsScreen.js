import React, { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { DataTable, Divider } from 'react-native-paper'
import ASafeAreaView from '@atoms/ASafeAreaView'
import AButton from '@atoms/AButton'
import ARadio from '@atoms/ARadio'
import ARadioGroup from '@atoms/ARadioGroup'
import { Colors } from '@constants'

export function MeetingPotentialClientsScreen({ navigation }) {
  const [potentialClient1, setPotentialClient1] = useState('0')
  const [potentialClient2, setPotentialClient2] = useState('0')
  const [potentialClient3, setPotentialClient3] = useState('0')

  return (
    <ASafeAreaView>
      <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title style={{ flex: 2 }}>Name</DataTable.Title>
            <DataTable.Title
              style={{
                justifyContent: 'center',
                marginLeft: -10,
              }}
            >
              Yes
            </DataTable.Title>
            <DataTable.Title
              style={{
                justifyContent: 'center',
                marginLeft: -2,
              }}
            >
              No
            </DataTable.Title>
            <DataTable.Title
              style={{
                justifyContent: 'center',
              }}
            >
              Not decided
            </DataTable.Title>
          </DataTable.Header>
          <ARadioGroup
            onValueChange={newValue => setPotentialClient1(newValue)}
            value={potentialClient1}
          >
            <DataTable.Row>
              <DataTable.Cell
                style={{ flex: 2, marginLeft: -16, paddingLeft: 16 }}
                onPress={() => navigation.navigate('Client')}
              >
                Lastname, Firstname
              </DataTable.Cell>
              <DataTable.Cell>
                <ARadio value="1" />
              </DataTable.Cell>
              <DataTable.Cell>
                <ARadio value="-1" />
              </DataTable.Cell>
              <DataTable.Cell>
                <ARadio value="0" />
              </DataTable.Cell>
            </DataTable.Row>
          </ARadioGroup>
          <ARadioGroup
            onValueChange={newValue => setPotentialClient2(newValue)}
            value={potentialClient2}
          >
            <DataTable.Row>
              <DataTable.Cell
                style={{ flex: 2, marginLeft: -16, paddingLeft: 16 }}
                onPress={() => navigation.navigate('Client')}
              >
                Lastname, Firstnameloremipsumdolorsitamet
              </DataTable.Cell>
              <DataTable.Cell>
                <ARadio value="1" />
              </DataTable.Cell>
              <DataTable.Cell>
                <ARadio value="-1" />
              </DataTable.Cell>
              <DataTable.Cell>
                <ARadio value="0" />
              </DataTable.Cell>
            </DataTable.Row>
          </ARadioGroup>
          <ARadioGroup
            onValueChange={newValue => setPotentialClient3(newValue)}
            value={potentialClient3}
          >
            <DataTable.Row>
              <DataTable.Cell
                style={{ flex: 2, marginLeft: -16, paddingLeft: 16 }}
                onPress={() => navigation.navigate('Client')}
              >
                Lastname, Firstname
              </DataTable.Cell>
              <DataTable.Cell>
                <ARadio value="1" />
              </DataTable.Cell>
              <DataTable.Cell>
                <ARadio value="-1" />
              </DataTable.Cell>
              <DataTable.Cell>
                <ARadio value="0" />
              </DataTable.Cell>
            </DataTable.Row>
          </ARadioGroup>
        </DataTable>
      </ScrollView>
      <View style={{ backgroundColor: Colors.white }}>
        <Divider />
        <View style={{ padding: 16 }}>
          <AButton mode="contained" onPress={() => navigation.goBack()}>
            Save
          </AButton>
        </View>
      </View>
    </ASafeAreaView>
  )
}

export default MeetingPotentialClientsScreen
