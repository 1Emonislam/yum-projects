import * as Sentry from 'sentry-expo'
import { AuthProvider, QueryProvider } from 'shared'
import { LogBox } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import { settings, theme } from '@constants'
import { AbhayaLibre_700Bold, useFonts } from '@expo-google-fonts/abhaya-libre'
import AppLoading from 'expo-app-loading'
import Navigation from '@navigation'
import React from 'react'
import { currentRealmApp, sentry } from 'shared/yamrc'

LogBox.ignoreLogs(['Setting a timer'])

if (currentRealmApp.isProduction) {
  Sentry.init({
    dsn: sentry.mobile.dsn,
    environment: currentRealmApp.sentryEnvironment,
    normalizeDepth: 7,
    ignoreErrors: [
      'Failed to download manifest from URL: https://expo.io:443/@yamafrica/yam',
      'Location provider is unavailable. Make sure that location services are enabled.',
      'Network request failed',
      'Non-Error exception captured',
      'Maximum update depth exceeded',
    ],
  })
}

function App() {
  let [fontsLoaded] = useFonts({
    AbhayaLibre_700Bold,
  })

  return fontsLoaded ? (
    <PaperProvider theme={theme} settings={settings}>
      <AuthProvider>
        <QueryProvider>
          <Navigation />
        </QueryProvider>
      </AuthProvider>
    </PaperProvider>
  ) : (
    <AppLoading />
  )
}

export default App
