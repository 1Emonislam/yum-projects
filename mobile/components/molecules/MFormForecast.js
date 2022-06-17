import { Text } from 'react-native-paper'
import { View } from 'react-native'
import MFormCurrency from '@molecules/MFormCurrency'
import MFormText from '@molecules/MFormText'
import React from 'react'

const MFormForecast = ({
  type,
  description,
  id,
  control,
  errors,
  readOnly,
}) => (
  <View>
    <View style={{ paddingTop: 16 }}>
      <Text style={{ fontFamily: 'sans-serif-medium' }}>{type}</Text>
      {description && <Text>{description}</Text>}
    </View>
    <MFormCurrency
      label="Monthly income"
      name={`content.forecast.${id}.monthlyIncome`}
      control={control}
      errors={errors}
      readOnly={readOnly}
    />
    <MFormCurrency
      label="Monthly expenditure"
      name={`content.forecast.${id}.monthlyExpenditure`}
      control={control}
      errors={errors}
      readOnly={readOnly}
    />
    <MFormText
      label="Comment"
      name={`content.forecast.${id}.comment`}
      control={control}
      errors={errors}
      rules={{}} // Optional
      readOnly={readOnly}
    />
  </View>
)

export default MFormForecast
