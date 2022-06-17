const { ObjectId } = require('mongodb')

const moment = require('moment-timezone')

const openCashAtHandReport = async (
  _,
  { input },
  { dataSources, user, eventProcessor }
) => {
  const userId = user._id

  const { branchId, date, unlockReason } = input

  const cashAtHandForms = await dataSources.cashAtHandForms.collection
    .find({
      $or: [
        {
          branchId: ObjectId(branchId),
          dateIso: {
            $gt: moment(date, 'DD.MM.YYYY').startOf('day').toDate(),
          },
        },
        { branchId: ObjectId(branchId), date },
      ],
    })
    .toArray()

  const updateEvents = cashAtHandForms.map(cashAtHandForm => {
    return {
      _id: ObjectId(),
      type: 'update',
      obj: 'cashAtHandForm',
      objId: ObjectId(String(cashAtHandForm._id)),
      userId: ObjectId(String(userId)),
      payload: {
        closed: false,
        unlockReason,
      },
      timestamp: new Date(),
    }
  })

  const result = await Promise.all(
    updateEvents.map(event => eventProcessor.addEvent(event))
  )

  console.log(`Successfully inserted ${result.length} items!`)

  return { status: true }
}

module.exports = openCashAtHandReport
