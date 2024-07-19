import { StyleProp } from 'react-native'
import React from 'react'
import Maplibre, { LineLayerStyle } from '@maplibre/maplibre-react-native'
import { Colors } from 'src/utils/constants'


const FillColor: any = [
  'match',
  ['get', 'key'],
  'remeasurement', 'tomato',
  'single-tree-registration', Colors.SINGLE_TREE,
  'multi-tree-registration', Colors.MULTI_TREE,
  'removal-invasive-species', Colors.INVASIVE_SPECIES,
  'fire-suppression', Colors.FIRE_SUPRESSION,
  'fire-patrol', Colors.FIRE_PATROL,
  'fencing', Colors.FENCING,
  'marking-regenerant', Colors.MARKING_REGENERANT,
  'liberating-regenerant', Colors.LIBERATING_REGENERANT,
  'grass-suppression', Colors.GRASS_SUPRESSION,
  'firebreaks', Colors.FIREBREAKS,
  'assisting-seed-rain', Colors.SEED_RAIN,
  'soil-improvement', Colors.SOIL_IMPROVEMENT,
  'stop-tree-harvesting', Colors.STOP_HARVESTING,
  'direct-seeding', Colors.DIRECT_SEEDING,
  'enrichement-planting', Colors.ENRICHMENT_PLANTING,
  'other-intervention', Colors.OTHER_INTERVENTION,
  'maintenance', Colors.MAINTAINEANCE,
  Colors.SINGLE_TREE
]

const polyline: StyleProp<LineLayerStyle> = {
  lineWidth: 2,
  lineOpacity: 0.8,
  lineJoin: 'bevel',
}

interface Props {
  geoJSON: any
  onShapeSourcePress: (id: string) => void
}

const ClusterdShapSource = (props: Props) => {
  const { geoJSON, onShapeSourcePress } = props
  return (
    <Maplibre.ShapeSource
      id={'polygon'}
      shape={geoJSON}
      onPress={(e) => {
        if (e && e.features && e.features[0]) {
          onShapeSourcePress(e.features[0].properties.id || '')
        }
      }}>
      <Maplibre.FillLayer
        id={'inactivePolyFill'} // Unique ID for inactive FillLayer
        style={{
          fillOpacity: [
            'match',
            ['get', 'active'],
            'true', 0.5,
            0.2],
          fillColor: FillColor
        }}
      />
      <Maplibre.LineLayer
        id={'polylwne'}
        style={{ ...polyline, lineColor: FillColor }}
      />
    </Maplibre.ShapeSource>
  )
}

export default ClusterdShapSource