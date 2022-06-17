module.exports = [
  {
    $match: {
      obj: 'branch',
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
      name: {
        $last: '$payload.name',
      },
      initDate: {
        $last: '$payload.initDate',
      },
      initOpeningBalance: {
        $last: '$payload.initOpeningBalance',
      },
      address: {
        $last: '$payload.address',
      },
      others: {
        $last: '$payload.others',
      },
      createdAt: {
        $first: '$timestamp',
      },
      _id: '$objId',
      status: {
        $last: '$payload.status',
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
    $replaceRoot: {
      newRoot: {
        _id: '$id',
        name: '$data.name',
        address: '$data.address',
        others: '$data.others',
        status: {
          $cond: {
            if: {
              $eq: ['$is_deleted', true],
            },
            then: 'deleted',
            else: '$status',
          },
        },
        initDate: '$data.initDate',
        initOpeningBalance: '$data.initOpeningBalance',
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
