import store from 'src/store/index'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'
import AsyncStorage from '@react-native-async-storage/async-storage';

const setAndGetSessionId = async () => {
  let sessionId: any = await AsyncStorage.getItem('session-id');
  // if session ID is empty in AsyncStorage then creates a new unique session ID and and sores in AsyncStorage
  if (!sessionId) {
    sessionId = uuidv4();
    await AsyncStorage.setItem('session-id', sessionId);
  }
  return sessionId
}

const defaultHeaders = {
  "x-accept-versions": "2.0.0",
  "Content-Type": "application/json",
  "User-Agent": "treemapper/android/1.0.11"
}


export const fetchPostCall = async (uri: string, params: any) => {
  try {
    const token = store.getState().appState.accessToken
    if (!token) {
      throw new Error('No access token available')
    }
    const formBody = JSON.stringify(params, (_key, value) => (value !== null ? value : {}))
    const sessionId = await setAndGetSessionId()
    const response = await fetch(uri, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...defaultHeaders,
        "x-session-id": sessionId
      },
      body: formBody,
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const responseJson = await response.json()
    return responseJson
  } catch (err) {
    console.error('Error in fetchPostCall:', err)
    return null
  }
}

export const fetchGetCall = async (uri: string, authRequire: boolean,) => {
  try {
    const token = store.getState().appState.accessToken
    if (!token && authRequire) {
      throw new Error('No access token available')
    }
    const sessionId = await setAndGetSessionId()
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        ...defaultHeaders,
        "x-session-id": sessionId
      },
    })
    const responseJson = await response.json()
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return responseJson
  } catch (err) {
    return null
  }
}

export const fetchPutCall = async (uri: string, params: any) => {
  try {
    const token = store.getState().appState.accessToken
    if (!token) {
      throw new Error('No access token available')
    }
    const formBody = JSON.stringify(params, (_key, value) => (value !== null ? value : {}))
    const sessionId = await setAndGetSessionId()
    const response = await fetch(uri, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        ...defaultHeaders,
        "x-session-id": sessionId
      },
      body: formBody,
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const responseJson = await response.json()
    return responseJson
  } catch (err) {
    console.error('Error in fetchPostCall:', err)
    return null
  }
}

export const fetchDeleteCall = async (uri: string) => {
  try {
    const token = store.getState().appState.accessToken
    if (!token) {
      throw new Error('No access token available')
    }
    const sessionId = await setAndGetSessionId()
    const response = await fetch(uri, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        ...defaultHeaders,
        "x-session-id": sessionId
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const responseJson = await response.json()
    return responseJson
  } catch (err) {
    console.error('Error in fetchPostCall:', err)
    return null
  }
}