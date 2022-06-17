import { gql } from 'graphql-request'
import { useQuery } from 'react-query'
import { graphQLClient } from '../services'

const getAmortization = async ({ loanId, role }) => {
  if (!role || role !== 'admin') {
    return
  }

  const { amortization } = await graphQLClient.request(
    gql`
      query amortization($loanId: String) {
        amortization(input: $loanId) {
          installments {
            cumulativeInsurance
            cumulativeInterest
            due
            insurance
            insuranceLiability
            insuranceRealization
            interest
            interestReceivable
            interestUnearned
            monthlyAccruedInsurance
            monthlyAccruedInsuranceRealization
            monthlyAccruedInterest
            monthlyAccruedInterestRealization
            principalOutstandingClosingBalance
            principalOutstandingOpeningBalance
            principalRepayment
            realInsurance
            realization
            status
            target
            wasLate
          }
        }
      }
    `,
    { loanId }
  )

  return amortization
}

export const useAmortization = ({ loanId, role }) => {
  return useQuery(
    ['useAmortization', loanId, role],
    () => getAmortization({ loanId, role }),
    {
      enabled: loanId && role ? true : false,
    }
  )
}
