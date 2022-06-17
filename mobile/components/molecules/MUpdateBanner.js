import { Colors } from '@constants'
import { Paragraph } from 'react-native-paper'
import { StyleSheet, View } from 'react-native'
import { useAuth } from 'shared'
import { useFocusEffect } from '@react-navigation/core'
import * as Sentry from 'sentry-expo'
import * as Updates from 'expo-updates'
import AButtonWithLoader from '@atoms/AButtonWithLoader'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import React, { useCallback, useEffect, useState } from 'react'

const HOUR = 60 * 60 * 1000

const MUpdateBanner = ({
  forceCheckForUpdate = false,
  onForceCheckForUpdate = () => {},
}) => {
  const [visible, setVisible] = useState(false)
  const [newVersion, setNewVersion] = useState()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const { _id } = useAuth()

  const developmentMode = Constants.manifest?.packagerOpts?.dev === true

  useFocusEffect(() => {
    const handleAutomaticCheckForUpdate = async () => {
      const lastUpdate = await AsyncStorage.getItem('lastUpdate')

      if (!lastUpdate || new Date().getTime() - Number(lastUpdate) > HOUR) {
        await AsyncStorage.setItem('lastUpdate', String(new Date().getTime()))

        checkForUpdate()
      }
    }

    handleAutomaticCheckForUpdate()
  })

  useEffect(() => {
    if (forceCheckForUpdate) {
      checkForUpdate()
    }
  }, [checkForUpdate, forceCheckForUpdate])

  const checkForUpdate = useCallback(async () => {
    if (!developmentMode) {
      try {
        const update = await Updates.checkForUpdateAsync()

        if (update.isAvailable) {
          setNewVersion(update.manifest.version)
          setVisible(true)
        }
      } catch (error) {
        Sentry.Native.captureException(error, scope => {
          scope.setContext('error', error)

          if (_id) {
            scope.setUser({ id: _id })
          }
        })
      }
    }

    if (forceCheckForUpdate) {
      onForceCheckForUpdate()
    }
  }, [_id, developmentMode, forceCheckForUpdate, onForceCheckForUpdate])

  const download = async () => {
    if (!developmentMode) {
      setIsDownloading(true)

      try {
        await Updates.fetchUpdateAsync()

        setIsDownloaded(true)
      } catch (error) {
        Sentry.Native.captureException(error, scope => {
          scope.setContext('error', error)

          if (_id) {
            scope.setUser({ id: _id })
          }
        })
      }
    }
  }

  const install = async () => {
    if (!developmentMode) {
      setIsUpdating(true)

      Updates.reloadAsync()
    }
  }

  return visible ? (
    <View
      style={{
        backgroundColor: '#fff',
        paddingTop: 21,
        paddingLeft: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.placeholder,
      }}
    >
      <Paragraph>
        A new version of the app ({newVersion}) is available
      </Paragraph>
      <View
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          paddingTop: 14,
          paddingRight: 8,
          paddingBottom: 8,
          height: 58,
        }}
      >
        {!isDownloaded && (
          <AButtonWithLoader loading={isDownloading} onPress={download}>
            Download
          </AButtonWithLoader>
        )}
        {isDownloaded && (
          <AButtonWithLoader loading={isUpdating} onPress={install}>
            Install
          </AButtonWithLoader>
        )}
      </View>
    </View>
  ) : (
    <View></View>
  )
}

export default MUpdateBanner
