import React from 'react'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom'
import { QueryProvider } from 'shared'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'

import './App.css'

import MAdminRoute from './components/molecules/MAdminRoute'
import MPrivateRoute from './components/molecules/MPrivateRoute'
import PAdminBranch from './components/pages/PAdminBranch'
import PAdminBranchEdit from './components/pages/PAdminBranchEdit'
import PAdminBranches from './components/pages/PAdminBranches'
import PAdminEmployee from './components/pages/PAdminEmployee'
import PAdminEmployeeEdit from './components/pages/PAdminEmployeeEdit'
import PAdminEmployeeNew from './components/pages/PAdminEmployeeNew'
import PAdminEmployees from './components/pages/PAdminEmployees'
import PAdminHolidayEdit from './components/pages/PAdminHolidayEdit'
import PAdminHolidayNew from './components/pages/PAdminHolidayNew'
import PAdminHolidays from './components/pages/PAdminHolidays'
import PAdminLoan from './components/pages/PAdminLoan'
import PAdminLoanEdit from './components/pages/PAdminLoanEdit'
import PAdminLoans from './components/pages/PAdminLoans'
import PClientEdit from './components/pages/PClientEdit'
import PClientForm from './components/pages/PClientForm'
import PClientForms from './components/pages/PClientForms'
import PClientInstallments from './components/pages/PClientInstallments'
import PClientLoan from './components/pages/PClientLoan'
import PClientLoanEdit from './components/pages/PClientLoanEdit'
import PClientLoans from './components/pages/PClientLoans'
import PClientMeetings from './components/pages/PClientMeetings'
import PClients from './components/pages/PClients'
import PForms from './components/pages/PForms'
import PGroupClients from './components/pages/PGroupClients'
import PGroupEdit from './components/pages/PGroupEdit'
import PGroupLoans from './components/pages/PGroupLoans'
import PGroupMeeting from './components/pages/PGroupMeeting'
import PGroupMeetings from './components/pages/PGroupMeetings'
import PGroups from './components/pages/PGroups'
import PLoans from './components/pages/PLoans'
import PNotFound from './components/pages/PNotFound'
import PReportsCashAtHand from './components/pages/PReportsCashAtHand'
import PReportsCollectionsOverview from './components/pages/PReportsCollectionsOverview'
import PReportsBranchOverview from './components/pages/PReportsBranchOverview'
import PReportsLoans from './components/pages/PReportsLoans'
import PSignIn from './components/pages/PSignIn'
import PSignInVerification from './components/pages/PSignInVerification'
import PSignOut from './components/pages/PSignOut'
import PResetPassword from './components/pages/PResetPassword'
import PChangePassword from './components/pages/PChangePassword'

function App() {
  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <QueryProvider>
        <Router>
          <Switch>
            <Route path="/" exact component={PSignIn} />
            <Route path="/verification" component={PSignInVerification} />
            <Route path="/reset-password" component={PResetPassword} />

            {/* App redirects */}
            <Redirect path="/app" exact to="/forms" />
            <Redirect path="/groups" exact to="/groups/pending" />
            <Redirect path="/forms" exact to="/forms/pending" />
            <Redirect path="/loans" exact to="/loans/pending" />
            <Redirect path="/reports" exact to="/reports/cash-at-hand" />
            <Redirect path="/clients" exact to="/clients/active" />
            <Redirect path="/admin" exact to="/admin/holidays" />

            {/* Prototype redirects */}
            <Redirect path="/groups/group" exact to="/groups/group/clients" />
            <Redirect path="/clients/client" exact to="/clients/client/loans" />

            {/* Private routes */}
            <MAdminRoute path="/admin">
              <Route
                path="/admin/reports/loans"
                exact
                component={PReportsLoans}
              />
              <Route
                path="/admin/clients/:clientId/loans/:loanId/edit"
                exact
                component={PClientLoanEdit}
              />
              <Route
                path="/admin/holidays/new"
                exact
                component={PAdminHolidayNew}
              />
              <Route
                path="/admin/holidays/:holidayId"
                exact
                component={PAdminHolidayEdit}
              />
              <Route path="/admin/holidays" exact component={PAdminHolidays} />
            </MAdminRoute>
            <MPrivateRoute path="/">
              {/* Prototype routes */}
              <Route path="/groups/group/edit" exact component={PGroupEdit} />
              <Route
                path="/groups/group/clients"
                exact
                component={PGroupClients}
              />
              <Route path="/groups/group/loans" exact component={PGroupLoans} />
              <Route
                path="/groups/group/meetings/meeting"
                exact
                component={PGroupMeeting}
              />
              <Route
                path="/groups/group/meetings"
                exact
                component={PGroupMeetings}
              />
              <Route
                path="/clients/client/loans/loan"
                exact
                component={PClientLoan}
              />
              <Route
                path="/clients/client/loans"
                exact
                component={PClientLoans}
              />
              <Route
                path="/clients/client/installments"
                exact
                component={PClientInstallments}
              />
              <Route
                path="/clients/client/meetings"
                exact
                component={PClientMeetings}
              />
              <Route
                path="/clients/client/forms/form"
                exact
                component={PClientForm}
              />
              <Route
                path="/clients/client/forms"
                exact
                component={PClientForms}
              />
              <Route
                path="/clients/client/edit"
                exact
                component={PClientEdit}
              />
              <Route
                path="/clients/:status(active|inactive|surveyed|all)/:branchId/:clientGroupId"
                exact
                component={PClients}
              />
              <Route
                path="/clients/:status(active|inactive|surveyed|all)/:branchId"
                exact
                component={PClients}
              />
              <Route
                path="/clients/:status(active|inactive|surveyed|all)"
                exact
                component={PClients}
              />
              <Route
                path="/reports/cash-at-hand"
                exact
                component={PReportsCashAtHand}
              />
              <Route
                path="/reports/collections-overview"
                exact
                component={PReportsCollectionsOverview}
              />
              <Route
                path="/reports/branch-overview"
                exact
                component={PReportsBranchOverview}
              />
              <Route
                path="/admin/employees/employee/edit"
                exact
                component={PAdminEmployeeEdit}
              />
              <Route
                path="/admin/employees/employee"
                exact
                component={PAdminEmployee}
              />
              <Route
                path="/admin/employees/new"
                exact
                component={PAdminEmployeeNew}
              />
              <Route
                path="/admin/employees"
                exact
                component={PAdminEmployees}
              />
              <Route
                path="/admin/branches/branch/edit"
                component={PAdminBranchEdit}
              />
              <Route
                path="/admin/branches/branch"
                exact
                component={PAdminBranch}
              />
              <Route path="/admin/branches" exact component={PAdminBranches} />
              <Route
                path="/admin/loans/loan/edit"
                exact
                component={PAdminLoanEdit}
              />
              <Route path="/admin/loans/loan" exact component={PAdminLoan} />
              <Route path="/admin/loans" exact component={PAdminLoans} />
              {/* App routes */}
              <Route
                path="/forms/:status(pending|approved|rejected|all)"
                exact
                component={PForms}
              />
              <Route
                path="/loans/:status(pending|approved|active|all)"
                exact
                component={PLoans}
              />
              <Route
                path="/groups/:clientGroupId/clients"
                exact
                component={PGroupClients}
              />
              <Route
                path="/groups/:clientGroupId/meetings/:meetingId"
                exact
                component={PGroupMeeting}
              />
              <Route
                path="/groups/:clientGroupId/meetings"
                exact
                component={PGroupMeetings}
              />
              <Route
                path="/groups/:status(pending|active|inactive|all)/:branchId"
                exact
                component={PGroups}
              />
              <Route
                path="/groups/:status(pending|active|inactive|all)"
                exact
                component={PGroups}
              />
              <Redirect
                path="/groups/:clientGroupId"
                from="/groups/:clientGroupId"
                exact
                to="/groups/:clientGroupId/clients"
              />
              <Route
                path="/clients/:clientId/loans/:loanId"
                exact
                component={PClientLoan}
              />
              <Route
                path="/clients/:clientId/loans"
                exact
                component={PClientLoans}
              />
              <Route
                path="/clients/:clientId/installments"
                exact
                component={PClientInstallments}
              />
              <Route
                path="/clients/:clientId/forms"
                exact
                component={PClientForms}
              />
              <Route
                path="/clients/:clientId/forms/:formId"
                exact
                component={PClientForm}
              />
              <Redirect
                path="/clients/:clientId"
                from="/clients/:clientId"
                exact
                to="/clients/:clientId/loans"
              />
              
              <Route path="/password" exact component={PChangePassword} />
              <Route path="/signout" component={PSignOut} />
              <Route path="*" component={PNotFound} />
            </MPrivateRoute>

            {/* Not found view */}
            <Route path="*" component={PNotFound} />
          </Switch>
        </Router>
      </QueryProvider>
    </MuiPickersUtilsProvider>
  )
}

export default App
