import { Colors } from '@constants'
import { IconButton, Text, TouchableRipple } from 'react-native-paper'
import { View } from 'react-native'
import MFormPhoto from '@molecules/MFormPhoto'
import MFormSignature from '@molecules/MFormSignature'
import MFormText from '@molecules/MFormText'
import React from 'react'

const MFormGuarantor = ({
  number,
  type,
  control,
  errors,
  screen,
  navigation,
  signed,
  taken,
  readOnly = { readOnly },
}) => (
  <View>
    <View style={{ paddingTop: 16 }}>
      <Text style={{ fontFamily: 'sans-serif-medium' }}>
        Guarantor #{number} ({type})
      </Text>
    </View>
    <MFormText
      label="Name"
      name={`content.guarantors[${Number(Number(number) - 1)}].name`}
      control={control}
      errors={errors}
      readOnly={readOnly}
    />
    <MFormText
      label="Relation with the client"
      name={`content.guarantors[${Number(Number(number) - 1)}].relation`}
      control={control}
      errors={errors}
      readOnly={readOnly}
    />
    <MFormText
      label="National ID or Voter ID number"
      name={`content.guarantors[${Number(
        Number(number) - 1
      )}].nationalVoterIdNumber`}
      control={control}
      errors={errors}
      readOnly={readOnly}
    />
    <MFormPhoto
      label="National ID or Voter ID photo"
      context={`Guarantor #${number} (${type}): National ID or Voter ID`}
      name={`content.guarantors[${Number(
        Number(number) - 1
      )}].nationalVoterIdPhoto`}
      control={control}
      errors={errors}
      screen={screen}
      navigation={navigation}
      taken={taken}
      readOnly={readOnly}
    />
    <MFormPhoto
      label="Photo of the guarantor"
      context={`Guarantor #${number} (${type})`}
      name={`content.guarantors[${Number(Number(number) - 1)}].photo`}
      control={control}
      errors={errors}
      screen={screen}
      navigation={navigation}
      taken={taken}
      readOnly={readOnly}
    />
    <MFormSignature
      label="Signature"
      context={`Guarantor #${number} (${type})`}
      name={`content.guarantors[${Number(Number(number) - 1)}].signature`}
      sign="Take a signature"
      control={control}
      errors={errors}
      screen={screen}
      navigation={navigation}
      signed={signed}
      fingerprint
      readOnly={readOnly}
    />
  </View>
)

export default MFormGuarantor
