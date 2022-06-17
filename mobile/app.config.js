import { secrets, sentry } from 'shared/yamrc'

export default {
  name: 'Yam',
  slug: 'yam',
  owner: 'yamafrica',
  version: '2.27.5',
  privacy: 'unlisted',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  android: {
    versionCode: 169,
    package: 'com.yamafrica.app',
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'CAMERA'],
    adaptiveIcon: {
      backgroundColor: '#fabc76',
      foregroundImage: './assets/icon.png',
    },
  },
  extra: {
    realmAppId: process.env.REACT_APP_REALM_APP_ID,
  },
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          organization: sentry.organization,
          project: sentry.mobile.project,
          authToken: secrets.SENTRY_AUTH_TOKEN_MOBILE,
        },
      },
    ],
  },
}
