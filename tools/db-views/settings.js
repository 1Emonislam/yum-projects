module.exports = [
  {
    $match: {
      obj: 'setting',
    },
  },
  {
    $group: {
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
      _id: '$objId',
      id: {
        $first: '$objId',
      },
      createdAt: {
        $first: '$timestamp',
      },
      updatedAt: {
        $last: '$timestamp',
      },
      data: {
        $mergeObjects: '$payload',
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
        value: '$data.value',
        createdAt: '$createdAt',
        updatedAt: '$updatedAt',
      },
    },
  },
  {
    $sort: {
      _id: 1,
    },
  },
]
