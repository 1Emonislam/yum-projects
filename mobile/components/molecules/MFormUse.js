import { Text } from 'react-native-paper'
import { View } from 'react-native'
import MFormCurrency from '@molecules/MFormCurrency'
import MFormText from '@molecules/MFormText'
import React from 'react'

const MFormUse = ({ context, description, id, control, errors, readOnly }) => (
  <View>
    <View style={{ paddingTop: 16 }}>
      <Text style={{ fontFamily: 'sans-serif-medium' }}>{context}</Text>
      {description && <Text>{description}</Text>}
    </View>
    <MFormCurrency
      label="Cost"
      name={`content.utilization.${id}.cost`}
      control={control}
      errors={errors}
      rules={{ valueAsNumber: true }} // Optional
      readOnly={readOnly}
    />
    <MFormCurrency
      label="Value of present item"
      name={`content.utilization.${id}.value`}
      control={control}
      errors={errors}
      rules={{ valueAsNumber: true }} // Optional
      readOnly={readOnly}
    />
    <MFormText
      label="The items as security"
      name={`content.utilization.${id}.security`}
      control={control}
      errors={errors}
      rules={{}} // Optional
      readOnly={readOnly}
    />
  </View>
)

export default MFormUse
