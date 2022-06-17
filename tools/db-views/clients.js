module.exports = [
  {
    $match: {
      obj: 'client',
    },
  },
  {
    $group: {
      updatedAt: {
        $last: '$timestamp',
      },
      lastEventId: {
        $last: '$_id',
      },
      id: {
        $first: '$objId',
      },
      firstName: {
        $last: '$payload.firstName',
      },
      lastName: {
        $last: '$payload.lastName',
      },
      code: {
        $last: '$payload.code',
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
      data: {
        $mergeObjects: '$payload',
      },
      status: {
        $last: '$payload.status',
      },
      clientGroupId: {
        $last: '$payload.clientGroupId',
      },
      addedAt: {
        $last: '$payload.addedAt',
      },
      admissionAt: {
        $last: '$payload.admissionAt',
      },
      lastRenewalAt: {
        $last: '$payload.lastRenewalAt',
      },
      loans: {
        $last: '$payload.loans',
      },
      createdAt: {
        $first: '$timestamp',
      },
      _id: '$objId',
      photo: {
        $last: '$payload.photo',
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
        addedAt: '$data.addedAt',
        admission: '$data.admission',
        admissionAt: '$data.admissionAt',
        clientGroupId: '$data.clientGroupId',
        code: '$data.code',
        createdAt: '$createdAt',
        firstName: '$data.firstName',
        lastEventId: '$lastEventId',
        lastName: '$data.lastName',
        lastRenewalAt: '$data.lastRenewalAt',
        loans: {
          $ifNull: ['$data.loans', []],
        },
        passbook: '$data.passbook',
        photo: '$data.photo',
        role: '$data.role',
        status: '$data.status',
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
