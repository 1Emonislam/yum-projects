module.exports = [
  {
    $match: {
      obj: 'loanProduct',
    },
  },
  {
    $group: {
      loanInsurance: {
        $last: '$payload.loanInsurance',
      },
      requiredDocuments: {
        $last: '$payload.requiredDocuments',
      },
      updatedAt: {
        $last: '$timestamp',
      },
      limits: {
        $last: '$payload.limits',
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
      data: {
        $mergeObjects: '$payload',
      },
      cashCollateral: {
        $last: '$payload.cashCollateral',
      },
      riskCover: {
        $last: '$payload.riskCover',
      },
      loanIncrementEachCycle: {
        $last: '$payload.loanIncrementEachCycle',
      },
      serviceCharge: {
        $last: '$payload.serviceCharge',
      },
      _id: '$objId',
      firstLoanDisbursement: {
        $last: '$payload.firstLoanDisbursement',
      },
      loanProcessingFee: {
        $last: '$payload.loanProcessingFee',
      },
      createdAt: {
        $first: '$timestamp',
      },
      advanceInstallments: {
        $last: '$payload.advanceInstallments',
      },
      requiredGuarantors: {
        $last: '$payload.requiredGuarantors',
      },
      id: {
        $first: '$objId',
      },
      name: {
        $last: '$payload.name',
      },
      disbursement: {
        $last: '$payload.disbursement',
      },
      durations: {
        $last: '$payload.durations',
      },
      initialLoan: {
        $last: '$payload.initialLoan',
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
        durations: '$data.durations',
        gracePeriod: '$data.gracePeriod',
        loanIncrementEachCycle: '$data.loanIncrementEachCycle',
        updatedAt: '$updatedAt',
        loanInsurance: '$data.loanInsurance',
        firstLoanDisbursement: '$data.firstLoanDisbursement',
        disbursement: '$data.disbursement',
        limits: '$data.limits',
        createdAt: '$createdAt',
        _id: '$id',
        name: '$data.name',
        serviceCharge: '$data.serviceCharge',
        requiredDocuments: '$data.requiredDocuments',
        riskCover: '$data.riskCover',
        loanProcessingFee: '$data.loanProcessingFee',
        advanceInstallments: '$data.advanceInstallments',
        requiredGuarantors: '$data.requiredGuarantors',
        status: '$data.status',
        cashCollateral: '$data.cashCollateral',
        initialLoan: '$data.initialLoan',
      },
    },
  },
  {
    $sort: {
      _id: 1,
    },
  },
]
