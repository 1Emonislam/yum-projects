const { AbilityBuilder, Ability } = require('@casl/ability')

/**
 * Subjects
 *
 * - all
 * - Branch
 * - CashAtHandForm
 * - ClientGroup
 * - ClientGroupMeeting
 * - Client
 * - Event
 * - Feedback
 * - Form
 * - Holiday
 * - LoanProduct
 * - Loan
 * - SecurityBalance
 * - Setting
 * - User
 */

function defineAbilityFor(user) {
  const { can, build } = new AbilityBuilder(Ability)

  switch (user.role) {
    case 'admin':
      can('manage', 'all')
      break
    case 'regionalManager':
      can('read', 'Branch', { _id: { $in: user.branchIds } })
      can(
        ['read'],
        [
          'CashAtHandForm',
          'ClientGroup',
          'Feedback',
          'Loan',
          'SecurityBalance',
        ],
        {
          branchId: { $in: user.branchIds },
        }
      )
      can('read', 'User', { _id: user._id })

      // TODO: find a way to filter access to these, if need be.
      can(
        ['read'],
        [
          'ClientGroupMeeting',
          'Client',
          'Event',
          'Form',
          'Holiday',
          'LoanProduct',
          'Setting',
        ]
      )
      break
    case 'areaManager':
      can('read', 'Branch', { _id: { $in: user.branchIds } })
      can(
        ['read'],
        [
          'CashAtHandForm',
          'ClientGroup',
          'Feedback',
          'Loan',
          'SecurityBalance',
        ],
        {
          branchId: { $in: user.branchIds },
        }
      )
      can('read', 'User', { _id: user._id })

      // TODO: find a way to filter access to these, if need be.
      can(
        ['read'],
        [
          'ClientGroupMeeting',
          'Client',
          'Event',
          'Form',
          'Holiday',
          'LoanProduct',
          'Setting',
        ]
      )
      break
    case 'branchManager':
      can(['read', 'update'], ['Branch'], { _id: user.branchId })
      can(
        ['read', 'update'],
        [
          'CashAtHandForm',
          'ClientGroup',
          'Feedback',
          'Loan',
          'SecurityBalance',
        ],
        {
          branchId: user.branchId,
        }
      )
      can('read', 'User', { _id: user._id })
      // TODO: find a way to filter access to these, if need be.
      can('read', [
        'ClientGroupMeeting',
        'Client',
        'Event',
        'Form',
        'Holiday',
        'LoanProduct',
        'Setting',
      ])
      break
    case 'loanOfficer':
      // TODO: add loan officer abilities, if need be.
      break
    default:
      break
  }

  return build()
}

module.exports = { defineAbilityFor }
