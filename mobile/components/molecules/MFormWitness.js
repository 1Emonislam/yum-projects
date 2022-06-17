import { Colors } from '@constants'
import { IconButton, Text, TouchableRipple } from 'react-native-paper'
import { View } from 'react-native'
import MFormPhoto from '@molecules/MFormPhoto'
import MFormSignature from '@molecules/MFormSignature'
import MFormText from '@molecules/MFormText'
import React from 'react'

const MFormWitness = ({
  number,
  control,
  errors,
  screen,
  navigation,
  readOnly,
  signed,
}) => (
  <View>
    <View style={{ paddingTop: 16 }}>
      <Text style={{ fontFamily: 'sans-serif-medium' }}>Witness #{number}</Text>
    </View>
    <MFormText
      label="Name"
      name={`signatures.witnesses[${Number(Number(number) - 1)}].name`}
      control={control}
      errors={errors}
      helperText="Last name, first name"
      readOnly={readOnly}
    />
    <MFormSignature
      label="Signature"
      context={`Witness #${number}`}
      name={`signatures.witnesses[${Number(Number(number) - 1)}].signature`}
      sign="Take a signature"
      control={control}
      errors={errors}
      screen={screen}
      navigation={navigation}
      signed={signed}
      readOnly={readOnly}
    />
  </View>
)

export default MFormWitness
