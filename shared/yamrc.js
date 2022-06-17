const secrets = require('./yamsecrets.js')
const realmAppId = require('./realmAppId')
const localApiUrl = require('./localApiUrl')
const realmApps = {
  'yam-development': {
    appId: 'yam-development-gjhai',
    appInternalId: '60193a2e0f193ddbe17ab7f2',
  },
  'yam-staging': {
    appId: 'yam-staging-kkkvy',
    appInternalId: '6066df300b4920e213e208a0',
    isProtected: false,
    isProduction: true,
    sentryEnvironment: 'staging',
  },
  'dev-chris': {
    appId: 'dev-chris-wlvrj',
    appInternalId: '606dbb93e1e33ed6739f7d6d',
    apiUrl: localApiUrl,
  },
  onaws: {
    isProtected: false,
    isProduction: true,
    sentryEnvironment: 'onaws',
    apiUrl: 'https://staging.api.yamafrica.com',
  },
  'dev-kacper': {
    appId: 'dev-kacper-fdrlh',
    appInternalId: '606b8e5de1e33ed673066874',
  },
  'dev-greg': {
    appId: 'dev-greg-uidqt',
    appInternalId: '606b8dbfe1e33ed67306111f',
    apiUrl: localApiUrl,
  },
  'dev-gideon': {
    apiUrl: localApiUrl,
  },
  'yam-production': {
    appId: 'yam-production-xrzum',
    appInternalId: '6079a7e8dc58c14ab361922f',
    isProtected: true,
    isProduction: true,
    sentryEnvironment: 'production',
  },
  staging: {
    isProtected: false,
    isProduction: true,
    sentryEnvironment: 'staging',
    apiUrl: 'https://staging.api.yamafrica.com',
  },
  staging2: {
    isProtected: false,
    isProduction: true,
    sentryEnvironment: 'staging2',
    apiUrl: 'https://staging2.api.yamafrica.com',
  },
  'bm-collections-overview': {
    isProtected: false,
    isProduction: true,
    sentryEnvironment: 'bm-collections-overview',
    apiUrl: 'https://bm-collections-overview.api.yamafrica.com',
  },
  production: {
    isProtected: true,
    isProduction: true,
    sentryEnvironment: 'production',
    apiUrl: 'https://prod.api.yamafrica.com',
  },
}

const sentry = {
  organization: 'yam-africa',
  mobile: {
    project: 'mobile',
    dsn: 'https://b4828360303f4724b1551bf79e13082f@o571522.ingest.sentry.io/5719881',
  },
  web: {
    project: 'web',
    dsn: 'https://eab215df603d4974bfd537f16cb4c81a@o571522.ingest.sentry.io/5731091',
  },
}

const rowsPerPage = 100

module.exports = {
  realmApps,
  currentRealmApp: realmApps[realmAppId],
  rowsPerPage,
  secrets,
  sentry,
}
