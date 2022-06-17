module.exports = [
  {
    $match: {
      obj: 'loan',
    },
  },
  {
    $group: {
      loanProduct: {
        $last: '$payload.loanProduct',
      },
      approvedAmount: {
        $last: '$payload.approvedAmount',
      },
      installments: {
        $last: '$payload.installments',
      },
      forms: {
        $last: '$payload.forms',
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
      id: {
        $first: '$objId',
      },
      requestedAmount: {
        $last: '$payload.requestedAmount',
      },
      status: {
        $last: '$payload.status',
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
      clientId: {
        $last: '$payload.clientId',
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
        branchName: '$data.branchName',
        loanOfficerId: '$data.loanOfficerId',
        requestedAmount: '$data.requestedAmount',
        approvedAmount: '$data.approvedAmount',
        clientId: '$data.clientId',
        disbursementAt: '$data.disbursementAt',
        disbursementPhoto: '$data.disbursementPhoto',
        createdAt: '$createdAt',
        updatedAt: '$updatedAt',
        applicationAt: '$data.applicationAt',
        branchManagerName: '$data.branchManagerName',
        loanProductName: '$data.loanProductName',
        loanGracePeriod: '$data.loanGracePeriod',
        installments: '$data.installments',
        status: '$data.status',
        managerDecisionAt: '$data.managerDecisionAt',
        branchManagerId: '$data.branchManagerId',
        code: '$data.code',
        cycle: '$data.cycle',
        interestRate: '$data.interestRate',
        cashCollateral: '$data.cashCollateral',
        branchId: '$data.branchId',
        loanOfficerName: '$data.loanOfficerName',
        loanProductId: '$data.loanProductId',
        clientGroupId: '$data.clientGroupId',
        clientGroupName: '$data.clientGroupName',
        duration: '$data.duration',
        signatures: '$data.signatures',
        loanInsurance: '$data.loanInsurance',
        loanProcessingFee: '$data.loanProcessingFee',
        edited: '$data.edited',
        feedbackId: '$data.feedbackId',
        _id: '$id',
        forms: '$data.forms',
      },
    },
  },
  {
    $sort: {
      _id: 1,
    },
  },
]
