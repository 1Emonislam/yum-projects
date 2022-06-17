import { Controller } from 'react-hook-form'
import { List } from 'react-native-paper'
import capitalize from 'lodash/capitalize'
import React from 'react'

const MFormRole = ({ clientGroup, control, role, navigation }) => (
  <>
    <Controller control={control} name={`${role}Id`} defaultValue="" />
    <Controller
      control={control}
      name={`${role}Name`}
      render={({ value }) => (
        <List.Item
          title={value || 'Tap to select'}
          description={capitalize(role)}
          onPress={() =>
            navigation.navigate('Client Group: Edit: Role', {
              role,
              clientGroup,
            })
          }
        />
      )}
      defaultValue=""
    />
  </>
)

export default MFormRole
