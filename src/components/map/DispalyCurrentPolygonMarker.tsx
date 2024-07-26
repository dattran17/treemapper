import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { scaleFont, scaleSize } from 'src/utils/constants/mixins'
import { Colors, Typography } from 'src/utils/constants'
import Icon from '@expo/vector-icons/FontAwesome5';

interface Props {
  id: string
  undo: () => void
}

const DispalyCurrentPolygonMarker = (props: Props) => {
  const { id, undo } = props
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Corner {id}</Text>
      <Text style={styles.note}>Please select the {id === 'A' ? 'first' : 'next'} corner</Text>
      {id !== 'A' && <TouchableOpacity style={styles.undoButton} onPress={undo}>
      <Text style={styles.undoLable}>Undo</Text>
        <Icon
          name="undo-alt"
          size={16}
          color={Colors.GRAY_DARK}
        />
      </TouchableOpacity>}
    </View>
  )
}

export default DispalyCurrentPolygonMarker

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: scaleSize(50),
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 20,
    zIndex: 1
  },
  label: {
    fontSize: scaleFont(18),
    fontFamily: Typography.FONT_FAMILY_BOLD
  },
  note: {
    fontSize: scaleFont(14),
    fontFamily: Typography.FONT_FAMILY_REGULAR
  },
  undoButton: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.NEW_PRIMARY + '1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  undoLable: {
    fontSize: scaleFont(12),
    fontFamily: Typography.FONT_FAMILY_SEMI_BOLD,
    marginRight: 5,
    color: Colors.TEXT_LIGHT,
    marginBottom: 5
  }

})
