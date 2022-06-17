module.exports = [
  {
    $match: {
      obj: 'clientGroupMeeting',
    },
  },
  {
    $sort: {
      timestamp: 1,
    },
  },
  {
    $group: {
      createdAt: {
        $first: '$timestamp',
      },
      scheduledAt: {
        $last: '$payload.scheduledAt',
      },
      startedAt: {
        $last: '$payload.startedAt',
      },
      endedAt: {
        $last: '$payload.endedAt',
      },
      code: {
        $last: '$payload.code',
      },
      attendance: {
        $last: '$payload.attendance',
      },
      _id: '$objId',
      clientGroupId: {
        $first: '$payload.clientGroupId',
      },
      id: {
        $first: '$objId',
      },
      data: {
        $mergeObjects: '$payload',
      },
      installments: {
        $last: '$payload.installments',
      },
      loanOfficer: {
        $last: '$payload.loanOfficer',
      },
      place: {
        $last: '$payload.place',
      },
      requests: {
        $last: '$payload.requests',
      },
      notes: {
        $last: '$payload.notes',
      },
      updatedAt: {
        $last: '$timestamp',
      },
      photoUrl: {
        $last: '$payload.photoUrl',
      },
      potentialClientsVerified: {
        $last: '$payload.potentialClientsVerified',
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
        clientGroupId: '$clientGroupId',
        potentialClientsVerified: '$potentialClientsVerified',
        notes: '$notes',
        scheduledAt: '$scheduledAt',
        startedAt: '$startedAt',
        photoUrl: '$photoUrl',
        endedAt: '$endedAt',
        updatedAt: '$updatedAt',
        createdAt: '$createdAt',
        _id: '$id',
        attendance: '$data.attendance',
        installments: '$data.installments',
        loanOfficer: '$loanOfficer',
        place: '$place',
        requests: '$requests',
      },
    },
  },
  {
    $sort: {
      timestamp: 1,
    },
  },
]
