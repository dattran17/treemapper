import { StyleSheet } from 'react-native'
import React from 'react'
import Header from 'src/components/common/Header'
import PointMarkerMap from 'src/components/map/PoinMarkerMap'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'
import GpsAccuracyTile from 'src/components/map/GpsAccuracyTile'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from 'src/utils/constants'

const PointMarkerView = () => {
  const formFlowData = useSelector((state: RootState) => state.formFlowState)
  return (
    <SafeAreaView style={styles.container}>
      <Header
        label={formFlowData.location_title}
        rightComponet={<GpsAccuracyTile />}
      />
      <PointMarkerMap formData={formFlowData} />
    </SafeAreaView>
  )
}

export default PointMarkerView

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE
  },
})
