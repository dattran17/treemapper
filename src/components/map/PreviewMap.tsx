import {StyleSheet, View} from 'react-native'
import React, {useEffect, useRef} from 'react'
import MapLibreGL, {Camera} from '@maplibre/maplibre-react-native'
import {SampleTree} from 'src/types/interface/slice.interface'
import MapMarkers from './MapMarkers'
import MapShapeSource from './MapShapeSource'
import bbox from '@turf/bbox'
import { Colors } from 'src/utils/constants'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MapStyle = require('../../../assets/mapStyle/mapStyleOutput.json')

interface Props {
  geoJSON: any
  has_sample_trees: boolean
  sampleTrees: SampleTree[]
}

const PreviewMap = (props: Props) => {
  const {geoJSON, sampleTrees, has_sample_trees} = props
  const cameraRef = useRef<Camera>(null)

  useEffect(() => {
    if (cameraRef) {
      setTimeout(() => {
        handleCamera()
      }, 1000)
    }
  }, [])

  const handleCamera = () => {
    const bounds = bbox(geoJSON.features[0].geometry)
    cameraRef.current.fitBounds(
      [bounds[0], bounds[1]],
      [bounds[2], bounds[3]],
      40,
      1000,
    )
  }

  const handlePress = () => {
    return
  }
  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <MapLibreGL.MapView
          style={styles.map}
          attributionEnabled={false}
          logoEnabled={false}
          styleURL={JSON.stringify(MapStyle)}>
          <MapLibreGL.Camera ref={cameraRef} />
          <MapShapeSource
            geoJSON={geoJSON.features}
            onShapeSourcePress={handlePress}
          />
          {has_sample_trees && <MapMarkers sampleTreeData={sampleTrees} />}
        </MapLibreGL.MapView>
      </View>
    </View>
  )
}

export default PreviewMap

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    width: '90%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth:0.5,
    borderColor:Colors.GRAY_TEXT
  },
  map: {
    flex: 1,
  },
})