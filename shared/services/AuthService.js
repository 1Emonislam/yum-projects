import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import jwt_decode from 'jwt-decode'
import { currentRealmApp } from 'shared/yamrc'

const INIT_AUTH_URL = `${currentRealmApp.apiUrl}/initAuth`

const LOGIN_AUTH_URL = `${currentRealmApp.apiUrl}/login`

const REQUEST_PASSWORD_RESET_AUTH_URL = `${currentRealmApp.apiUrl}/requestPasswordReset`

const RESET_PASSWORD_AUTH_URL = `${currentRealmApp.apiUrl}/resetPassword`

const REFRESH_TOKEN_URL = `${currentRealmApp.apiUrl}/session`

const TOKENS_KEY = 'tokens'

export async function initLogIn(phoneNumber, source = 'web') {
  return axios.post(
    INIT_AUTH_URL,
    { phoneNumber, source },
    {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  )
}

export async function logIn(phoneNumber, code) {
  const response = await axios.post(
    LOGIN_AUTH_URL,
    { phoneNumber, code },
    {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  )
  const tokens = response.data
  await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

export async function requestPasswordReset(phoneNumber) {
  return axios.post(
    REQUEST_PASSWORD_RESET_AUTH_URL,
    { phoneNumber },
    {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  )
}

export async function resetPassword(phoneNumber, password, otpCode) {
  return axios.post(
    RESET_PASSWORD_AUTH_URL,
    { phoneNumber, password, otpCode },
    {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  )
}

export async function logOut() {
  if (typeof FS !== 'undefined') {
    FS.anonymize()
  }
  return AsyncStorage.removeItem('tokens')
}

export async function getTokens() {
  try {
    const tokens = await AsyncStorage.getItem(TOKENS_KEY)
    // TODO: add logic that checks wheather tokens are valid
    return JSON.parse(tokens)
  } catch (e) {
    return null
  }
}

export async function refreshToken() {
  let tokens = await getTokens()
  const response = await axios.post(
    REFRESH_TOKEN_URL,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens?.refresh_token}`,
      },
    }
  )

  tokens = response.data

  await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

export async function isAuthenticated() {
  try {
    const tokens = await AsyncStorage.getItem(TOKENS_KEY)
    // TODO: add logic that checks wheather tokens are valid
    return tokens != null
  } catch (e) {
    return false
  }
}

export async function getUserData() {
  try {
    const tokens = await AsyncStorage.getItem(TOKENS_KEY)
    const parsedTokens = JSON.parse(tokens)

    const userData = jwt_decode(parsedTokens['access_token']).user_data

    try {
      if (typeof FS !== 'undefined') {
        FS.identify(userData._id, {
          displayName: `${userData.firstName} ${userData.lastName}`,
          firstName: userData.firstName,
          lastName: userData.lastName,
        })
      }
    } catch (e) {
      console.log('FS not available')
      // noop
    }

    return {
      id: userData._id,
      ...userData,
    }
  } catch (e) {
    // console.log('getUserData error', e)
    return false
  }
}
