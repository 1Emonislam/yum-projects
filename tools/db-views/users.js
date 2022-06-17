module.exports = [
  {
    $match: {
      obj: 'user',
    },
  },
  {
    $group: {
      _id: '$objId',
      id: {
        $first: '$objId',
      },
      data: {
        $mergeObjects: '$payload',
      },
      firstName: {
        $last: '$payload.firstName',
      },
      lastName: {
        $last: '$payload.lastName',
      },
      fullPhoneNumber: {
        $last: '$payload.fullPhoneNumber',
      },
      realmUserId: {
        $first: '$payload.realmUserId',
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
    $match: {
      is_deleted: false,
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        _id: '$id',
        firstName: '$data.firstName',
        lastName: '$data.lastName',
        fullPhoneNumber: '$data.fullPhoneNumber',
        realmUserId: '$data.realmUserId',
        role: '$data.role',
        branchId: '$data.branchId',
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
