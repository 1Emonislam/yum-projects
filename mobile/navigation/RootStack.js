import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import MainTab from './MainTab'
import AHeader from '@atoms/AHeader'
import InspectionsScreen from '@screens/InspectionsScreen'
import MeetingScreen from '@screens/MeetingScreen'
import MeetingPhotoScreen from '@screens/MeetingPhotoScreen'
import MeetingAttendanceScreen from '@screens/MeetingAttendanceScreen'
import MeetingAttendanceManualScreen from '@screens/MeetingAttendanceManualScreen'
import MeetingAttendanceManualEditScreen from '@screens/MeetingAttendanceManualEditScreen'
import MeetingDecisionsScreen from '@screens/MeetingDecisionsScreen'
import MeetingInstallmentsScreen from '@screens/MeetingInstallmentsScreen'
import MeetingInstallmentScreen from '@screens/MeetingInstallmentScreen'
import MeetingRequestsScreen from '@screens/MeetingRequestsScreen'
import MeetingNotesScreen from '@screens/MeetingNotesScreen'
import FormLoanApplicationScreen from '@screens/FormLoanApplicationScreen'
import FormClientInspectionScreen from '@screens/FormClientInspectionScreen'
import SignatureScreen from '@screens/SignatureScreen'
import FingerprintScreen from '@screens/FingerprintScreen'
import PhotoScreen from '@screens/PhotoScreen'
import ClientScreen from '@screens/ClientScreen'
import ClientPhotoScreen from '@screens/ClientPhotoScreen'
import ClientLoanScreen from '@screens/ClientLoanScreen'
import ClientLoanDisbursementScreen from '@screens/ClientLoanDisbursementScreen'
import ClientEditScreen from '@screens/ClientEditScreen'
import ClientNewScreen from '@screens/ClientNewScreen'
import ClientSaleScreen from '@screens/ClientSaleScreen'
import ClientSaleDetailsScreen from '@screens/ClientSaleDetailsScreen'
import ClientMembershipScreen from '@screens/ClientMembershipScreen'
import ClientGroupScreen from '@screens/ClientGroupScreen'
import ClientGroupNewScreen from '@screens/ClientGroupNewScreen'
import ClientGroupEditScreen from '@screens/ClientGroupEditScreen'
import ClientGroupEditRoleScreen from '@screens/ClientGroupEditRoleScreen'
import ChangePasswordScreen from '@screens/ChangePasswordScreen'

const { Navigator, Screen } = createStackNavigator()

export const RootStack = () => {
  return (
    <Navigator
      mode="modal"
      screenOptions={{
        header: AHeader,
      }}
    >
      <Screen
        name="Main"
        component={MainTab}
        options={{
          header: () => null,
        }}
      />
      <Screen
        name="Meeting"
        component={MeetingScreen}
        options={{
          title: 'Meeting',
        }}
      />
      <Screen
        name="Meeting: Take a photo"
        component={MeetingPhotoScreen}
        options={{
          title: 'Take a photo',
          close: true,
        }}
      />
      <Screen
        name="Meeting: Take attendance"
        component={MeetingAttendanceScreen}
        options={{
          title: 'Take attendance',
        }}
      />
      <Screen
        name="Meeting: Take attendance: Manual"
        component={MeetingAttendanceManualScreen}
        options={{
          title: 'Lastname, Firstname',
          subtitle: 'Manual attendance confirmation',
          close: true,
        }}
      />
      <Screen
        name="Meeting: Take attendance: Manual: Edit"
        component={MeetingAttendanceManualEditScreen}
      />
      <Screen
        name="Meeting: Communicate loan decisions"
        component={MeetingDecisionsScreen}
        options={{
          title: 'Communicate loan decisions',
        }}
      />
      <Screen
        name="Meeting: Collect installments"
        component={MeetingInstallmentsScreen}
        options={{
          title: 'Collect installments',
        }}
      />
      <Screen
        name="Meeting: Collect installments: Installment"
        component={MeetingInstallmentScreen}
      />
      {/* <Screen
        name="Meeting: Verify potential clients"
        component={MeetingPotentialClientsScreen}
        options={{
          title: 'Verify potential clients',
        }}
      /> */}
      <Screen
        name="Meeting: Document requests"
        component={MeetingRequestsScreen}
        options={{
          title: 'Document requests',
          subtitle: 'Loans, membership withdrawals',
        }}
      />
      <Screen
        name="Meeting: Add optional notes"
        component={MeetingNotesScreen}
        options={{
          title: 'Add optional notes',
        }}
      />
      <Screen
        name="Form: Loan Application"
        component={FormLoanApplicationScreen}
        options={{
          title: 'Loan application',
        }}
      />
      <Screen
        name="Form: Client Inspection"
        component={FormClientInspectionScreen}
        options={{
          title: 'Inspection',
        }}
      />
      <Screen
        name="Signature"
        component={SignatureScreen}
        options={{
          title: 'Signature',
          close: true,
        }}
      />
      <Screen name="Fingerprint" component={FingerprintScreen} />
      <Screen
        name="Photo"
        component={PhotoScreen}
        options={{
          title: 'Photo',
          close: true,
        }}
      />
      <Screen
        name="Client"
        component={ClientScreen}
        options={{
          close: true,
        }}
      />
      <Screen name="Client: Photo" component={ClientPhotoScreen} />
      <Screen
        name="Client: Loan"
        component={ClientLoanScreen}
        options={{
          title: 'Loan',
        }}
      />
      <Screen
        name="Client: Loan: Disbursement"
        component={ClientLoanDisbursementScreen}
        options={{
          title: 'Loan disbursement',
        }}
      />
      <Screen
        name="Client: Edit"
        component={ClientEditScreen}
        options={{
          title: 'Edit client',
        }}
      />
      <Screen
        name="Client: New"
        component={ClientNewScreen}
        options={{
          title: 'New client',
          close: true,
        }}
      />
      <Screen
        name="Client: Sale"
        component={ClientSaleScreen}
        options={{
          title: 'New sale',
          close: true,
        }}
      />
      <Screen
        name="Client: Sale: Details"
        component={ClientSaleDetailsScreen}
        options={{
          title: 'Passbook',
        }}
      />
      <Screen
        name="Client: Membership"
        component={ClientMembershipScreen}
        options={{
          title: 'Renew membership',
        }}
      />
      <Screen name="Client Group" component={ClientGroupScreen} />
      <Screen
        name="Client Group: New"
        component={ClientGroupNewScreen}
        options={{
          title: 'New group',
          close: true,
        }}
      />
      <Screen
        name="Client Group: Edit"
        component={ClientGroupEditScreen}
        options={{
          title: 'Edit group',
        }}
      />
      <Screen
        name="Client Group: Edit: Role"
        component={ClientGroupEditRoleScreen}
        options={{
          title: 'Select the president',
        }}
      />
      <Screen
        name="Inspections"
        component={InspectionsScreen}
        options={{
          title: 'Inspections',
        }}
      />
      <Screen
        name="Change password"
        component={ChangePasswordScreen}
        options={{
          title: 'Password',
          close: true,
        }}
      />
    </Navigator>
  )
}

export default RootStack
