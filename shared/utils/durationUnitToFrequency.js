const frequencies = {
  twoWeeks: 'biweekly',
  week: 'weekly',
  month: 'monthly',
}

export const durationUnitToFrequency = durationUnit => {
  return frequencies[durationUnit]
}
