import React, { useMemo } from 'react'
import { ScrollView } from 'react-native'
import { Checkbox, IconButton, List } from 'react-native-paper'
import ASafeAreaView from '@atoms/ASafeAreaView'
import { Colors } from '@constants'
import {
  useMeetingLogic,
  useClientsByClientGroupId,
  useLoansByClientIds,
} from 'shared'
import { useHeader } from '@hooks'

export function MeetingDecisionsScreen({ navigation, route }) {
  const clientGroupId = route?.params?.clientGroupId
  const { data: { clients = [] } = {} } = useClientsByClientGroupId(
    clientGroupId
  )
  // const [dialog, setDialog] = useState(false)
  // const showDialog = () => setDialog(true)
  // const hideDialog = () => setDialog(false)

  // const [snackbar, setSnackbar] = useState(true)
  // const showSnackbar = () => setSnackbar(true)
  // const hideSnackbar = () => setSnackbar(false)

  const [todayMeeting, mutate, isLoading] = useMeetingLogic(clientGroupId)
  const communicatedDecisions =
    todayMeeting?.decisions?.filter(decision => decision.communicated)
      ?.length ?? 0
  const clientsIds = clients.map(client => client._id)
  const { data: { loans = [] } = {} } = useLoansByClientIds(clientsIds)

  const decisions = useMemo(() => {
    return todayMeeting?.decisions.map(decision => {
      const client = clients?.find(client =>
        client.loans.includes(decision.loanId)
      )
      const loan = loans?.find(loan => loan.clientId === client?._id)
      const attendance = todayMeeting?.attendance?.find(
        a => a?.clientId === client?._id
      )
      const present = attendance?.attended || attendance?.representative
      const description = !present
        ? 'Not present at the meeting'
        : loan?.status === 'rejectedByManager'
        ? 'Rejected'
        : `Requested USh 600,000, approved USh 600,000` // FIXME: implement correct logic
      return {
        ...decision,
        client,
        clientId: client?._id,
        present,
        description,
      }
    })
  }, [clients, todayMeeting, loans])

  useHeader({
    subtitle: `Communicated ${communicatedDecisions} out of ${
      decisions?.length ?? 0
    } decisions`,
  })

  return (
    <ASafeAreaView>
      <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
        <List.Section>
          {decisions?.map(decision => {
            const {
              loanId,
              clientId,
              client: { firstName = '', lastName = '' } = {},
              description = '',
              present,
              communicated,
            } = decision

            return (
              <List.Item
                key={loanId}
                title={`${lastName}, ${firstName}`}
                description={description}
                left={() => (
                  <Checkbox
                    disabled={!present}
                    status={communicated ? 'checked' : 'unchecked'}
                    color={Colors.green}
                    onPress={() => {
                      mutate({
                        decisions: todayMeeting?.decisions.map(decision => {
                          if (decision?.loanId === loanId) {
                            return {
                              loanId,
                              communicated: !decision.communicated,
                            }
                          }
                          return decision
                        }),
                      })
                    }}
                  />
                )}
                right={() => (
                  <IconButton
                    disabled={!present}
                    icon="info"
                    size={24}
                    onPress={() =>
                      navigation.navigate('Client', {
                        clientId,
                      })
                    }
                  />
                )}
              />
            )
          })}
          {/* <List.Item
            title="Lastname, Firstname"
            description="Requested USh 150,000, approved USh 100,000"
            left={() => (
              <Checkbox
                status="unchecked"
                color={Colors.green}
                onPress={() => {}}
              />
            )}
            right={() => (
              <IconButton
                icon="info"
                size={24}
                onPress={() => navigation.navigate('Client')}
              />
            )}
          />
          <List.Item
            title="Lastname, Firstname"
            description="USh 200,000"
            left={() => (
              <Checkbox
                status="checked"
                color={Colors.green}
                onPress={() => {}}
              />
            )}
            right={() => (
              <IconButton
                icon="info"
                size={24}
                onPress={() => navigation.navigate('Client')}
              />
            )}
          />
          <List.Item
            title="Lastname, Firstname"
            description="Rejected"
            left={() => (
              <Checkbox
                status="unchecked"
                color={Colors.green}
                onPress={() => {}}
              />
            )}
            right={() => (
              <IconButton
                icon="info"
                size={24}
                onPress={() => navigation.navigate('Client')}
              />
            )}
          />
          <List.Item
            title="Lastname, Firstname"
            description="Not present at the meeting "
            left={() => (
              <Checkbox
                status="unchecked"
                disabled
                color={Colors.green}
                onPress={() => {}}
              />
            )}
            right={() => (
              <IconButton
                icon="info"
                size={24}
                disabled
                onPress={() => navigation.navigate('Client')}
              />
            )}
          /> */}
        </List.Section>
      </ScrollView>
    </ASafeAreaView>
  )
}

export default MeetingDecisionsScreen
