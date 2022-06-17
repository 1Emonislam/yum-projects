module.exports = [
  {
    $match: {
      obj: 'cashAtHandForm',
    },
  },
  {
    $group: {
      id: {
        $first: '$objId',
      },
      _id: '$objId',
      data: {
        $mergeObjects: '$payload',
      },
      receipts: {
        $last: '$payload.receipts',
      },
      payments: {
        $last: '$payload.payments',
      },
      openingBalance: {
        $last: '$payload.openingBalance',
      },
      date: {
        $last: '$payload.date',
      },
      dateIso: {
        $last: '$payload.date',
      },
      closed: {
        $last: '$payload.closed',
      },
      branchId: {
        $last: '$payload.branchId',
      },
      closingBalance: {
        $last: '$payload.closingBalance',
      },
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
    $replaceRoot: {
      newRoot: {
        _id: '$id',
        receipts: '$data.receipts',
        payments: '$data.payments',
        openingBalance: '$data.openingBalance',
        date: '$data.date',
        dateIso: '$data.dateIso',
        branchId: '$data.branchId',
        closingBalance: '$data.closingBalance',
        closed: '$data.closed',
        status: {
          $cond: {
            if: {
              $eq: ['$is_deleted', true],
            },
            then: 'deleted',
            else: '$status',
          },
        },
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
