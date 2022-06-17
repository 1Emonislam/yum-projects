import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'
import moment from 'moment'
import { timeFormat } from 'shared/constants'

const getCashAtHandForm = async ({ branchId, date } = {}) => {
  const { cashAtHandForm } = await graphQLClient.request(
    gql`
      query cashAtHandForm($branchId: ObjectId, $date: String) {
        cashAtHandForm(query: { branchId: $branchId, date: $date }) {
          _id
          branchId
          date
          closed
          closingBalance
          openingBalance
          payments {
            loanDisbursements
            securityWithdrawals
            toHeadOffice
            toHeadOfficeNotes
            toOtherBranches
            toOtherBranchesNotes
            expenses {
              rent
              rentNotes
              utilities
              utilitiesNotes
              staffTransport
              staffTransportNotes
              staffLunch
              staffLunchNotes
              staffAirtime
              staffAirtimeNotes
              officeManagement
              officeManagementNotes
              internet
              internetNotes
              insuranceClaim
              insuranceClaimNotes
              rubbishCollection
              rubbishCollectionNotes
              miscellaneous
              miscellaneousNotes
            }
            bankDeposit
            bankDepositNotes
            securityReturn
            securityReturnNotes
          }
          receipts {
            loanRelatedFundsReceived
            fromHeadOffice
            fromHeadOfficeNotes
            fromOtherBranches
            fromOtherBranchesNotes
            bankWithdrawal
            bankWithdrawalNotes
            otherIncome
            otherIncomeNotes
          }
        }
      }
    `,
    {
      branchId,
      date,
    }
  )

  return cashAtHandForm
}

export const useCashAtHandForm = ({
  date = moment().format(timeFormat.default),
  branchId = null,
} = {}) => {
  return useQuery(
    ['cashAtHandForm', branchId, date],
    () => getCashAtHandForm({ date, branchId }),
    {
      enabled: !!branchId,
    }
  )
}
