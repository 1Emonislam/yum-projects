import { useMutation } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const moveClientToAnotherClientGroup = async ({ clientId, clientGroupId }) => {
  const { moveClientToAnotherClientGroup } = await graphQLClient.request(
    gql`
      mutation moveClientToAnotherClientGroup(
        $clientId: String
        $clientGroupId: String
      ) {
        moveClientToAnotherClientGroup(
          input: { clientId: $clientId, clientGroupId: $clientGroupId }
        ) {
          status
        }
      }
    `,
    {
      clientId,
      clientGroupId,
    }
  )

  return moveClientToAnotherClientGroup
}

export const useMoveClientToAnotherclientGroup = () => {
  return useMutation(moveClientToAnotherClientGroup)
}
