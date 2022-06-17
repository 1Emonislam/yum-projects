import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services'

const getBmCollectionsOverview = async ({
  branchId,
  date,
  loanOfficerId,
  clientGroupId,
}) => {
  const { bmCollectionsOverview } = await graphQLClient.request(
    gql`
      query bmCollectionsOverview(
        $branchId: ObjectId
        $loanOfficerId: ObjectId
        $clientGroupId: ObjectId
        $date: String
      ) {
        bmCollectionsOverview(
          branchId: $branchId
          loanOfficerId: $loanOfficerId
          clientGroupId: $clientGroupId
          date: $date
        ) {
          todaysRealizationCash
          todaysRealizationSecurity
          loanOfficerName
          clientGroupName
          clientName
          meetingScheduledDate
        }
      }
    `,
    { branchId, date, loanOfficerId, clientGroupId }
  )

  return bmCollectionsOverview
}

export const useBmCollectionsOverview = ({
  branchId,
  date,
  loanOfficerId,
  clientGroupId,
}) => {
  return useQuery(
    ['bmCollectionsOverview', branchId, date],
    () =>
      getBmCollectionsOverview({
        branchId,
        date,
        loanOfficerId,
        clientGroupId,
      }),
    {
      enabled: !!branchId && !!date,
    }
  )
}
