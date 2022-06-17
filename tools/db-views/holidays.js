module.exports = [
  {
    $match: {
      obj: 'holiday',
    },
  },
  {
    $group: {
      id: {
        $first: '$objId',
      },
      data: {
        $mergeObjects: '$payload',
      },
      _id: '$objId',
      createdAt: {
        $first: '$timestamp',
      },
      updatedAt: {
        $last: '$timestamp',
      },
      history: {
        $push: {
          $cond: {
            if: {
              $eq: ['$type', 'delete'],
            },
            then: null,
            else: '$$ROOT',
          },
        },
      },
    },
  },
  {
    $addFields: {
      is_deleted: {
        $in: [null, '$history'],
      },
    },
  },
  {
    $match: {
      is_deleted: false,
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        _id: '$id',
        name: '$data.name',
        startAt: '$data.startAt',
        endAt: '$data.endAt',
        yearly: '$data.yearly',
        notes: '$data.notes',
        createdAt: '$createdAt',
        updatedAt: '$updatedAt',
      },
    },
  },
  {
    $sort: {
      _id: -1,
    },
  },
]
