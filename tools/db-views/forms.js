module.exports = [
  {
    $match: {
      obj: 'form',
    },
  },
  {
    $group: {
      signatures: {
        $mergeObjects: '$payload.signatures',
      },
      status: {
        $last: '$payload.status',
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
      loanOfficerId: {
        $first: '$payload.loanOfficerId',
      },
      type: {
        $first: '$payload.formType',
      },
      relatedFormId: {
        $first: '$payload.relatedFormId',
      },
      userId: {
        $first: '$userId',
      },
      notes: {
        $last: '$payload.notes',
      },
      startedAt: {
        $first: '$payload.startedAt',
      },
      updatedAt: {
        $last: '$timestamp',
      },
      lastEventId: {
        $last: '$_id',
      },
      id: {
        $first: '$objId',
      },
      code: {
        $first: '$payload.code',
      },
      locations: {
        $mergeObjects: '$payload.locations',
      },
      createdAt: {
        $first: '$timestamp',
      },
      clientId: {
        $first: '$payload.clientId',
      },
      content: {
        $mergeObjects: '$payload.content',
      },
      feedbackId: {
        $first: '$payload.feedbackId',
      },
      submittedAt: {
        $first: '$payload.submittedAt',
      },
      _id: '$objId',
      loanId: {
        $first: '$payload.loanId',
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
        submittedAt: '$submittedAt',
        _id: '$id',
        userId: '$userId',
        signatures: '$signatures',
        locations: '$locations',
        lastEventId: '$lastEventId',
        loanId: '$loanId',
        notes: {
          $ifNull: ['$notes', ''],
        },
        startedAt: '$startedAt',
        createdAt: '$createdAt',
        code: '$code',
        clientId: '$clientId',
        content: '$content',
        status: '$status',
        relatedFormId: '$relatedFormId',
        type: '$type',
        formType: '$formType',
        feedbackId: '$feedbackId',
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
