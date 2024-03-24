import {
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
  TouchableOpacity,
  View,
} from 'react-native'
import React from 'react'
import {scaleFont} from 'src/utils/constants/mixins'
import {Colors} from 'src/utils/constants'

interface Props {
  label: string
  containerStyle?: ViewStyle
  labelStyle?: TextStyle
  wrapperStyle?: ViewStyle
}

const CustomButton = (props: Props) => {
  const {label, containerStyle = {}, labelStyle = {}, wrapperStyle = {}} = props
  return (
    <TouchableOpacity style={[styles.container, {...containerStyle}]}>
      <View style={[styles.wrapper, {...wrapperStyle}]}>
        <Text style={[styles.lableStyle, {...labelStyle}]}>{label}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default CustomButton

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    marginBottom:10
  },
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
    width:'80%',
    height:'70%',
    backgroundColor: Colors.PRIMARY_DARK,
    borderRadius: 10,
  },
  lableStyle: {
    fontSize: scaleFont(16),
    fontWeight: '400',
    color: Colors.WHITE,
  },
})
