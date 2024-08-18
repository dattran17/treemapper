import { StyleSheet, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import MapLibreGL from '@maplibre/maplibre-react-native'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'
import CustomButton from '../common/CustomButton'
import { scaleFont, scaleSize } from 'src/utils/constants/mixins'
import ActiveMarkerIcon from '../common/ActiveMarkerIcon'
import LineMarker from './LineMarker'
import AlphabetMarkers from './AlphabetMarkers'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from 'src/types/type/navigation.type'
import DisplayCurrentPolygonMarker from './DisplayCurrentPolygonMarker'
import { Colors, Typography } from 'src/utils/constants'
import distanceCalculator from 'src/utils/helpers/turfHelpers'
import { useToast } from 'react-native-toast-notifications'
import { makeInterventionGeoJson } from 'src/utils/helpers/interventionFormHelper'
import useInterventionManagement from 'src/hooks/realm/useInterventionManagement'
import { errorHaptic } from 'src/utils/helpers/hapticFeedbackHelper'
import SatelliteIconWrapper from './SatelliteIconWrapper'
import SatelliteLayer from 'assets/mapStyle/satelliteView'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MapStyle = require('assets/mapStyle/mapStyleOutput.json')


interface Props {
  species_required: boolean
  form_id: string
}

const PolygonMarkerMap = (props: Props) => {
  const { species_required, form_id } = props

  const [currentCoordinate, setCurrentCoordinate] = useState({
    id: 'A',
    index: 0,
  })
  const [loading, setLoading] = useState(true)
  const [lineError, setLineError] = useState(false)
  const [coordinates, setCoordinates] = useState([])
  const [polygonComplete, setPolygonComplete] = useState(false)
  const currentUserLocation = useSelector(
    (state: RootState) => state.gpsState.user_location,
  )
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { updateInterventionLocation } = useInterventionManagement()
  const toast = useToast();

  const cameraRef = useRef<MapLibreGL.Camera>(null)
  const mapRef = useRef<MapLibreGL.MapView>(null)

  const mainMapView = useSelector(
    (state: RootState) => state.displayMapState.mainMapView
  )


  useEffect(() => {
    handleCamera()
  }, [currentUserLocation])

  const handleCamera = () => {
    if(cameraRef?.current){
      cameraRef.current.setCamera({
        centerCoordinate: [...currentUserLocation],
        zoomLevel: 20,
        animationDuration: 1000,
      })
    }
  }

  const handlePreviousPoint = () => {
    const updatedCoordinates = [...coordinates];
    updatedCoordinates.pop()
    setCoordinates(updatedCoordinates)
    setCurrentCoordinate(prevState => ({
      id: String.fromCharCode(prevState.id.charCodeAt(0) - 1),
      index: prevState.index - 1,
    }))
    if (updatedCoordinates.length <= 2) {
      setPolygonComplete(false)
    }
  }

  const onSelectLocation = async () => {
    const centerCoordinates = await mapRef.current.getCenter()
    if (centerCoordinates.length !== 0) {
      const checkValidDistance = await checkIsValidMarker(centerCoordinates, [...coordinates])
      setLineError(!checkValidDistance)
      if (!checkValidDistance) {
        errorHaptic()
        return
      }
      setCoordinates([...coordinates, centerCoordinates])
      setCurrentCoordinate(prevState => ({
        id: String.fromCharCode(prevState.id.charCodeAt(0) + 1),
        index: prevState.index++,
      }))
      if (coordinates.length >= 2) {
        setPolygonComplete(true)
      }
    }
  }


  const checkIsValidMarker = async (centerCoordinates: number[], coords: any) => {
    let isValidMarkers = true;

    for (const oneMarker of coords) {
      const distanceInMeters = distanceCalculator(
        [centerCoordinates[1], centerCoordinates[0]],
        [oneMarker[1], oneMarker[0]],
        'meters',
      );
      if (distanceInMeters < 1) {
        errorHaptic()
        toast.show("Marker is close to previous point.", {
          type: "normal",
          placement: "bottom",
          duration: 2000,
          animationType: "slide-in",
        })
        isValidMarkers = false;
      }
      if (distanceInMeters > 100) {
        errorHaptic()
        toast.show("Marker is too far from previous point.", {
          type: "normal",
          placement: "bottom",
          duration: 2000,
          animationType: "slide-in",
        })
        isValidMarkers = false;
      }
    }
    return isValidMarkers;
  };

  const makeComplete = async () => {
    const finalCoordinates = [...coordinates, coordinates[0]];
    if (coordinates.length === 3) {
      finalCoordinates.push(coordinates[0])
    }
    // setCoordinates([...finalCoordinates])
    const data = makeInterventionGeoJson('Point', finalCoordinates, form_id)
    const result = await updateInterventionLocation(form_id, { type: 'Polygon', coordinates: data.coordinates }, false)
    if (!result) {
      errorHaptic()
      toast.show('Error occurred while updating location')
      return
    }
    if (species_required) {
      navigation.navigate('ManageSpecies', { manageSpecies: false, id: form_id })
    } else {
      navigation.navigate('LocalForm',{ id:form_id })
    }
  }

  const onRegionDidChange = async () => {
    setLoading(false)
    setLineError(false)
  }


  return (
    <View style={styles.container}>
      <DisplayCurrentPolygonMarker
        id={currentCoordinate.id}
        undo={handlePreviousPoint}
      />
      <MapLibreGL.MapView
        style={styles.map}
        ref={mapRef}
        logoEnabled={false}
        onDidFinishLoadingMap={handleCamera}
        onRegionDidChange={onRegionDidChange}
        onRegionIsChanging={() => {
          setLoading(true)
        }}
        attributionEnabled={false}
        styleURL={JSON.stringify(mainMapView === 'SATELLITE' ? SatelliteLayer : MapStyle)}>
        <MapLibreGL.Camera ref={cameraRef} />
        <MapLibreGL.UserLocation
          showsUserHeadingIndicator
          androidRenderMode="gps"
          minDisplacement={1}
        />
        <LineMarker coordinates={coordinates} />
        <AlphabetMarkers coordinates={coordinates} />
      </MapLibreGL.MapView>
      <SatelliteIconWrapper />
      {polygonComplete && (
        <View style={styles.btnFooter}>
          <CustomButton
            label="Complete"
            containerStyle={styles.btnWrapper}
            pressHandler={makeComplete}
            wrapperStyle={styles.borderWrapper}
            labelStyle={styles.highlightLabel}
          />
          <CustomButton
            label="Continue"
            containerStyle={styles.btnWrapper}
            pressHandler={onSelectLocation}
            wrapperStyle={styles.opaqueWrapper}
            labelStyle={styles.normalLabel}
          />
        </View>
      )}
      {!polygonComplete && (
        <CustomButton
          label="Select location & continue"
          containerStyle={styles.btnContainer}
          pressHandler={onSelectLocation}
          disable={loading || lineError}
          loading={loading}
        />
      )}
      <ActiveMarkerIcon />
    </View>
  )
}

export default PolygonMarkerMap

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

  btnFooter: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    height: scaleSize(70),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    height: scaleSize(70),
  },
  btnWrapper: {
    flex: 1,
    height: '100%',
  },
  borderWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    width: '90%',
    height: '70%',
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.PRIMARY_DARK,
  },
  opaqueWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    width: '90%',
    height: '70%',
    backgroundColor: Colors.PRIMARY_DARK,
    borderRadius: 12,
  },
  highlightLabel: {
    fontSize: scaleFont(16),
    color: Colors.PRIMARY_DARK,
    fontFamily: Typography.FONT_FAMILY_BOLD
  },
  normalLabel: {
    fontSize: scaleFont(16),
    color: Colors.WHITE,
    textAlign: 'center',
    fontFamily: Typography.FONT_FAMILY_BOLD
  },
})
