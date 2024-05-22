import { StyleSheet, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import MapLibreGL, { Camera } from '@maplibre/maplibre-react-native'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/store'
import CustomButton from '../common/CustomButton'
import { scaleSize } from 'src/utils/constants/mixins'
import ActiveMarkerIcon from '../common/ActiveMarkerIcon'
import { useNavigation } from '@react-navigation/native'
import { RootStackParamList } from 'src/types/type/navigation.type'
import { StackNavigationProp } from '@react-navigation/stack'
import { updateFormCoordinates } from 'src/store/slice/registerFormSlice'
import { RegisterFormSliceInitalState } from 'src/types/interface/slice.interface'
import { v4 as uuidv4 } from 'uuid'
import { makeInterventionGeoJson } from 'src/utils/helpers/interventionFormHelper'
import { updateSampleTreeCoordinates } from 'src/store/slice/sampleTreeSlice'
import MapShapeSource from './MapShapeSource'
import i18next from 'i18next'
import * as Location from 'expo-location';
import AlertModal from '../common/AlertModal'
import {
  isPointInPolygon,
  // isPointInPolygon,
  validateMarkerForSampleTree,
} from 'src/utils/helpers/turfHelpers'
import MapMarkers from './MapMarkers'
import useInterventionManagement from 'src/hooks/realm/useInterventionManagement'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MapStyle = require('assets/mapStyle/mapStyleOutput.json')

interface Props {
  formData: RegisterFormSliceInitalState
}

const PointMarkerMap = (props: Props) => {
  const { species_required, is_multi_species, has_sample_trees, tree_details, key, form_id } = props.formData
  const [geoJSON, setGeoJSON] = useState(null)
  const [alertModal, setAlertModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const MapBounds = useSelector((state: RootState) => state.mapBoundState)
  const { boundry } = useSelector((state: RootState) => state.sampleTree)
  const [outOfBoundry, setOutOfBoundry] = useState(false)
  const { updateInterventionLocation } = useInterventionManagement()
  const currentUserLocation = useSelector(
    (state: RootState) => state.gpsState.user_location,
  )

  const dispatch = useDispatch()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const cameraRef = useRef<Camera>(null)
  const mapRef = useRef<MapLibreGL.MapView>(null)


  useEffect(() => {
    setTimeout(() => {
      if (cameraRef && cameraRef.current) {
        handleCameraViewChange()
      }
    }, 500)
  }, [MapBounds, currentUserLocation])

  const handleCameraViewChange = () => {
    const { bounds, key } = MapBounds
    if (key === 'POINT_MAP') {
      cameraRef.current.fitBounds(
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
        40,
        1000,
      )
    } else {
      handleCamera()
    }
  }

  useEffect(() => {
    if (has_sample_trees) {
      getMarkerJSON()
    }
  }, [boundry])



  const getMarkerJSON = () => {
    const data = makeInterventionGeoJson('Polygon', boundry, uuidv4(), { key: key })
    setGeoJSON(data.geoJSON)
  }
  const handleCamera = () => {
    cameraRef.current.setCamera({
      centerCoordinate: [...currentUserLocation],
      zoomLevel: 20,
      animationDuration: 1000,
    })
  }

  const onSelectLocation = async () => {
    const centerCoordinates = await mapRef.current.getCenter()
    if (has_sample_trees) {
      dispatch(updateSampleTreeCoordinates([centerCoordinates]))
    } else {
      const { coordinates } = makeInterventionGeoJson('Point', [centerCoordinates], '')
      await updateInterventionLocation(form_id, { type: 'Point', coordinates: coordinates }, false)
      dispatch(updateFormCoordinates([centerCoordinates]))
    }
    if (species_required) {
      if (is_multi_species) {
        navigation.navigate('TotalTrees', { isSelectSpecies: true })
      } else {
        navigation.navigate('ManageSpecies', { manageSpecies: false })
      }
    } else {
      navigation.navigate('LocalForm')
    }
  }

  const handleAccuracyAlert = (b: boolean) => {
    if (b) {
      setAlertModal(false)
    } else {
      onSelectLocation()
    }
  }

  const checkForAccuracy = async () => {
    const { coords } = await Location.getCurrentPositionAsync()
    if (coords && coords.accuracy && coords.accuracy >= 30) {
      setAlertModal(true)
    } else {
      onSelectLocation()
    }
  }

  const handleMarkerValidation = (coords: number[]) => {
    if (has_sample_trees) {
      const isValidPoint = validateMarkerForSampleTree(
        coords,
        tree_details,
      )
      return isValidPoint;
    } else {
      return true;
    }
  }


  const handleDrag = async () => {
    setLoading(false)
    if (has_sample_trees) {
      const centerCoordinates = await mapRef.current.getCenter()
      const validMarker = isPointInPolygon(centerCoordinates, geoJSON)
      const validSampleTree = handleMarkerValidation(centerCoordinates)
      if (!validSampleTree || !validMarker) {
        setOutOfBoundry(true)
      } else {
        setOutOfBoundry(false)
      }
    }
  }

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        ref={mapRef}
        logoEnabled={false}
        attributionEnabled={false}
        onRegionDidChange={handleDrag}
        onRegionIsChanging={() => {
          setLoading(true)
        }}
        styleURL={JSON.stringify(MapStyle)}>
        <MapLibreGL.Camera ref={cameraRef} />
        <MapLibreGL.UserLocation
          showsUserHeadingIndicator
          androidRenderMode="gps"
        />
        {geoJSON && (
          <MapShapeSource
            geoJSON={[geoJSON]}
            onShapeSourcePress={() => { }}
            showError={outOfBoundry}
          />
        )}
        {has_sample_trees && <MapMarkers
          hasSampleTree={has_sample_trees}
          sampleTreeData={tree_details} />}
      </MapLibreGL.MapView>
      <CustomButton
        label="Select location & Continue"
        containerStyle={styles.btnContainer}
        pressHandler={checkForAccuracy}
        loading={loading}
        disable={loading || outOfBoundry}
      />
      <ActiveMarkerIcon />
      <AlertModal
        visible={alertModal}
        heading={i18next.t('label.poor_accuracy')}
        message={i18next.t('label.poor_accuracy_message')}
        primaryBtnText={i18next.t('label.try_again')}
        secondaryBtnText={i18next.t('label.continue')}
        onPressPrimaryBtn={handleAccuracyAlert}
        onPressSecondaryBtn={handleAccuracyAlert}
        showSecondaryButton={true}
      />
    </View>
  )
}

export default PointMarkerMap

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
    alignSelf: 'stretch',
  },
  btnContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: scaleSize(70),
  },
})
