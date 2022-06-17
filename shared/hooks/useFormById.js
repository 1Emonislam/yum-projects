import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getFormById = async _id => {
  const { form } = await graphQLClient.request(
    gql`
      query form($_id: ObjectId) {
        form(query: { _id: $_id }) {
          _id
          code
          type
          loan: loanId {
            _id
            code
          }
          feedback: feedbackId {
            _id
            label
            question
            answer
            comment
          }
          content {
            dateOfBirth
            debt {
              amount
              source
            }
            fatherOrHusbandName
            forecast {
              core {
                monthlyIncome
                monthlyExpenditure
                comment
              }
              other {
                monthlyIncome
                monthlyExpenditure
                comment
              }
            }
            guarantors {
              name
              nationalVoterIdNumber
              nationalVoterIdPhoto {
                uri
                lat
                lng
              }
              photo {
                uri
                lat
                lng
              }
              relation
              signature
            }
            inspection {
              uri
            }
            loan {
              type
              name
              duration {
                value
                unit
              }
              cycle
              amount
              interestRate
            }
            loanRequirements {
              requirement
              name
              uri
              lat
              lng
            }
            maritalStatus
            mobilePhoneNumber
            nationalVoterIdNumber
            nationalVoterIdPhoto {
              uri
              lat
              lng
            }
            occupation
            partnersConsent
            photo {
              uri
              lat
              lng
            }
            previousLoan {
              amount
              cycle
              purpose
            }
            projects
            residence {
              area
              county
              subcounty
              district
              notes
            }
            sex
            utilization {
              workingCapital {
                cost
                value
                security
              }
              debtPayment {
                cost
                value
                security
              }
              equipment {
                cost
                value
                security
              }
              extension {
                cost
                value
                security
              }
              rent {
                cost
                value
                security
              }
              other {
                cost
                value
                security
              }
            }
            work {
              area
              county
              subcounty
              district
              notes
            }
          }
          signatures {
            client
            employee
          }
          locations {
            submission {
              lat
              lng
            }
            start {
              lat
              lng
            }
          }
          notes
          status
          user: userId {
            firstName
            lastName
          }
          createdAt
          updatedAt
        }
      }
    `,
    { _id }
  )

  return form
}

export const useFormById = id => {
  return useQuery(['formById', id], () => getFormById(id), {
    enabled: !!id,
  })
}
