module.exports = [
  {
    $lookup: {
      as: 'forms',
      from: 'forms',
      localField: '_id',
      foreignField: 'clientId',
    },
  },
  {
    $match: {
      forms: {
        $size: 0,
      },
    },
  },
  {
    $project: {
      forms: 0,
    },
  },
]
