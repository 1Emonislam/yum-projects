import { getClientsCount } from './useClientsCount'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'
import { useMutation } from 'react-query'

export const useCreateClientMutation = () => {
  return useMutation(async data => {
    const clientsCount = await getClientsCount()

    const code = ['C', String(Number(clientsCount + 1)).padStart(3, '0')].join(
      ''
    )

    const {
      address,
      firstName,
      group,
      lastName,
      notes,
      passbookIdentifier,
      admissionSmallBusinessLoan,
    } = data

    return await graphQLClient.request(
      gql`
        mutation insertEvent(
          $address: String
          $code: String
          $firstName: String
          $group: ObjectId
          $lastName: String
          $notes: String
          $passbookIdentifier: String
          $admissionSmallBusinessLoan: Boolean
          $timestamp: DateTime
        ) {
          addEvent(
            input: {
              type: "create"
              obj: "client"
              payload: {
                firstName: $firstName
                lastName: $lastName
                code: $code
                role: "member"
                clientGroupId: $group
                admission: {
                  address: $address
                  notes: $notes
                  smallBusinessLoan: $admissionSmallBusinessLoan
                }
                passbook: true
                passbookIdentifier: $passbookIdentifier
                addedAt: $timestamp
                status: "toSurvey"
              }
            }
          ) {
            _id
          }
        }
      `,
      {
        address,
        code,
        firstName,
        group,
        lastName,
        notes,
        passbookIdentifier,
        admissionSmallBusinessLoan,
        timestamp: new Date(),
      }
    )
  })
}
