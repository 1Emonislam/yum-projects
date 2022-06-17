module.exports = [
  {
    $match: {
      obj: 'clientGroup',
    },
  },
  {
    $group: {
      createdAt: {
        $first: '$timestamp',
      },
      id: {
        $first: '$objId',
      },
      data: {
        $mergeObjects: '$payload',
      },
      code: {
        $last: '$payload.code',
      },
      status: {
        $last: '$payload.status',
      },
      loanOfficerId: {
        $last: '$payload.loanOfficerId',
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
      _id: '$objId',
      name: {
        $last: '$payload.name',
      },
      meeting: {
        $last: '$payload.meeting',
      },
      branchId: {
        $last: '$payload.branchId',
      },
      updatedAt: {
        $last: '$timestamp',
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
        branchId: '$data.branchId',
        createdAt: '$createdAt',
        updatedAt: '$updatedAt',
        name: '$data.name',
        code: '$data.code',
        meeting: '$data.meeting',
        status: '$data.status',
        loanOfficerId: '$data.loanOfficerId',
        wasRejected: '$data.wasRejected',
        presidentId: '$data.presidentId',
        secretaryId: '$data.secretaryId',
        cashierId: '$data.cashierId',
      },
    },
  },
  {
    $sort: {
      _id: 1,
    },
  },
]
