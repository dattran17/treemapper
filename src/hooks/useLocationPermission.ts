import { useEffect } from 'react'
import * as Location from 'expo-location'
import { useDispatch, useSelector } from 'react-redux';
import { updateBlockerModal, updateAccuracy, updateUserLocation } from 'src/store/slice/gpsStateSlice';
import useLogManagement from './realm/useLogManagement';
import { RootState } from 'src/store';

const useLocationPermission = () => {
  const [status, requestForegroundPermissionsAsync] = Location.useForegroundPermissions();

  const showBlockerModal = useSelector((state: RootState) => state.gpsState.showBlockerModal)
  const dispatch = useDispatch()
  const { addNewLog } = useLogManagement()


  useEffect(() => {
    if (status && status.status === Location.PermissionStatus.DENIED) {
      dispatch(updateBlockerModal(true))
      addNewLog({
        logType: 'LOCATION',
        message: "Location permission denied",
        logLevel: 'warn',
        statusCode: '',
      })
    }

    if (status && status.status === Location.PermissionStatus.GRANTED && !showBlockerModal) {
      dispatch(updateBlockerModal(false))
      userCurrentLocation()
    }
  }, [])


  useEffect(() => {
    requestLocationPermission()
  }, [])


  const userCurrentLocation = async () => {
    if (status && status.status === Location.PermissionStatus.GRANTED) {
      getLastKnowLocation()
      const userLocationDetails = await Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.Highest
      })
      if (userLocationDetails?.coords?.longitude && userLocationDetails?.coords?.latitude) {
        dispatch(updateUserLocation([userLocationDetails.coords.longitude, userLocationDetails.coords.latitude]))
        dispatch(updateAccuracy(userLocationDetails.coords.accuracy))
      }
    } else {
      await requestLocationPermission();
    }
  }

  const getLastKnowLocation = async () => {
    try {
      const lastLocation = await Location.getLastKnownPositionAsync()
      if (lastLocation?.coords) {
        dispatch(updateUserLocation([lastLocation.coords.longitude, lastLocation.coords.latitude]))
        dispatch(updateAccuracy(lastLocation.coords.accuracy))
      }
    } catch (error) {
      addNewLog({
        logType: 'LOCATION',
        message: JSON.stringify(error),
        logLevel: 'error',
        statusCode: ''
      })
    }
  }



  const requestLocationPermission = async () => {
    await Location.enableNetworkProviderAsync()
    await requestForegroundPermissionsAsync()
  }


  return { userCurrentLocation }
}

export default useLocationPermission
