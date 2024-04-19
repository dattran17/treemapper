import {StyleProp} from 'react-native'
import React from 'react'
import MapLibreGL, {LineLayerStyle} from '@maplibre/maplibre-react-native'
import {Colors} from 'src/utils/constants'

const polyline: StyleProp<LineLayerStyle> = {
  lineWidth: 2,
  lineOpacity: 0.5,
  lineJoin: 'bevel',
}
const fillStyle = {fillOpacity: 0.3}
// const circleStyle = {circleColor: Colors.PRIMARY_DARK, circleOpacity: 0.8}
const bigCircleStyle = {
  circleColor: Colors.PRIMARY_DARK,
  circleOpacity: 0.5,
  circleRadius: 12,
}

interface Props {
  geoJSON: any
  onShapeSourcePress: (id: string) => void
  showError?: boolean
}

const MapShapeSource = (props: Props) => {
  const {geoJSON, onShapeSourcePress, showError} = props
  const pressHandle = (el: any) => {
    onShapeSourcePress(el.properties.id)
  }
  return (
    <>
      {geoJSON.map(feature => {
        const id = `feature-${feature.properties.id}`
        switch (feature.geometry.type) {
          case 'Point':
            return (
              <MapLibreGL.ShapeSource
                key={feature.properties.id}
                id={id}
                shape={feature}
                onPress={() => {
                  pressHandle(feature)
                }}>
                <MapLibreGL.CircleLayer
                  id={'singleSelectedPolyCircle' + feature.properties.id}
                  style={bigCircleStyle}
                />
              </MapLibreGL.ShapeSource>
            )
          case 'Polygon':
            return (
              <MapLibreGL.ShapeSource
                key={feature.properties.id}
                id={id}
                shape={feature}
                onPress={() => {
                  pressHandle(feature)
                }}>
                <MapLibreGL.FillLayer
                  id={'polyFill' + feature.properties.id}
                  style={{
                    ...fillStyle,
                    fillColor: showError ? Colors.LIGHT_RED : Colors.PRIMARY,
                  }}
                />
                <MapLibreGL.LineLayer
                  id={'polyline' + feature.properties.id}
                  style={{
                    ...polyline,
                    lineColor: showError ? Colors.LIGHT_RED : Colors.PRIMARY,
                  }}
                />
              </MapLibreGL.ShapeSource>
            )
          case 'LineString':
            return (
              <MapLibreGL.ShapeSource
                key={feature.properties.id}
                id={id}
                shape={feature}
                onPress={() => {
                  pressHandle(feature)
                }}>
                <MapLibreGL.LineLayer id={`${feature.properties.id}-layer`} />
              </MapLibreGL.ShapeSource>
            )
          default:
            return null
        }
      })}
    </>
  )
}

export default MapShapeSource
