module.exports = [
  {
    $match: {
      obj: 'feedback',
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
        loanId: '$data.loanId',
        clientId: '$data.clientId',
        branchId: '$data.branchId',
        loanOfficerId: '$data.loanOfficerId',
        label: '$data.label',
        question: '$data.question',
        answer: '$data.answer',
        comment: '$data.comment',
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
