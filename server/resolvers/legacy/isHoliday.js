const moment = require('moment-timezone')

const isHoliday = async (
  dataSources,
  timezone,
  momentDateObj = moment(),
  includeStartDate = false
) => {
  let isHoliday = false

  const holidays = await dataSources.holidays.collection.find().toArray()

  holidays.forEach(holiday => {
    let startAt = moment(holiday.startAt).tz(timezone)
    let endAt = moment(holiday.endAt).tz(timezone)

    if (holiday.yearly) {
      const shouldAddYearToEndAt =
        Number(endAt.format('Y')) > Number(startAt.format('Y'))

      const currentYear = momentDateObj.year()

      startAt.year(currentYear)
      endAt.year(shouldAddYearToEndAt ? currentYear + 1 : currentYear)
    }

    if (
      momentDateObj.isBetween(
        startAt,
        endAt,
        'day',
        includeStartDate ? '[]' : '(]'
      )
    ) {
      isHoliday = true
    }
  })

  return isHoliday
}

module.exports = isHoliday
