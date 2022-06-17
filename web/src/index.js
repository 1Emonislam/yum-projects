import 'shared'
import { AuthProvider, AuthorizationProvider } from 'shared'
import { ThemeProvider } from '@material-ui/core/styles'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import App from './App'
import CssBaseline from '@material-ui/core/CssBaseline'
import React from 'react'
import ReactDOM from 'react-dom'
import theme from './theme'
import { currentRealmApp, sentry } from 'shared/yamrc'
import { version } from './../package.json'

if (currentRealmApp.isProduction) {
  Sentry.init({
    dsn: sentry.web.dsn,
    integrations: [new Integrations.BrowserTracing()],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.2,
    environment: currentRealmApp.sentryEnvironment,
    release: `web@${version}`,
    ignoreErrors: [
      "Failed to execute 'getComputedStyle' on 'Window': parameter 1 is not of type 'Element'.",
    ],
  })
}

// import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <AuthorizationProvider>
        <App />
      </AuthorizationProvider>
    </AuthProvider>
  </ThemeProvider>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
