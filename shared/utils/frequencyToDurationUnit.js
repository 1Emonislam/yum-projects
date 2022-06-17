const durationUnits = {
  biweekly: 'twoWeeks',
  weekly: 'week',
  monthly: 'month',
}

export const frequencyToDurationUnit = frequency => {
  return durationUnits[frequency]
}
