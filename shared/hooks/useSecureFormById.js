import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useQuery } from 'react-query'

const getFormById = async ({ id, role, userId, branchId }) => {
  let query = {
    _id: id,
  }

  if (['loanOfficer', 'branchManager'].includes(role)) {
    query.clientId = {}
    query.clientId.clientGroupId = {}
  }

  switch (role) {
    case 'loanOfficer':
      query.clientId.clientGroupId.loanOfficerId = { _id: userId }
      break
    case 'branchManager':
      query.clientId.clientGroupId.branchId = { _id: branchId }
      break
  }

  const { form } = await graphQLClient.request(
    gql`
      query form($query: FormQueryInput) {
        form(query: $query) {
          _id
          code
          type
          formType
          loan: loanId {
            _id
            code
            status
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
    { query }
  )

  return form
}

export const useSecureFormById = ({ id, role, userId, branchId }) => {
  return useQuery(
    ['formById', id, role, userId, branchId],
    () => getFormById({ id, role, userId, branchId }),
    {
      enabled: !!id && !!role && !!userId,
    }
  )
}
