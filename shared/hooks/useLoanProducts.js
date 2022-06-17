import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getLoanProducts = async () => {
  const { loanProducts } = await graphQLClient.request(
    gql`
      query {
        loanProducts(sortBy: _ID_ASC) {
          _id
          name
          durations {
            weekly
            biweekly
            monthly
          }
          cashCollateral {
            initialLoan
            furtherLoans
          }
          gracePeriods {
            durationValue
            durationUnit
            gracePeriodDays
          }
          firstLoanDisbursement
          initialLoan {
            durationValue
            durationUnit
            from
            to
          }
          loanIncrementEachCycle {
            durationValue
            durationUnit
            from
            to
          }
          loanInsurance
          loanProcessingFee {
            type
            value
          }
          serviceCharges {
            charge
            durationValue
            durationUnit
          }
          limits {
            durationValue
            durationUnit
            limit
          }
          requiredGuarantors {
            family
            group
          }
          requiredDocuments {
            initialLoan {
              _id
              name
            }
            furtherLoans {
              _id
              name
            }
          }
          status
        }
      }
    `
  )

  return loanProducts
}

export const useLoanProducts = () => {
  return useQuery('allLoanProducts', getLoanProducts)
}
