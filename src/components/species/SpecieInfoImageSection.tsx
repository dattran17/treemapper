import {Image, StyleSheet, TouchableOpacity, View} from 'react-native'
import React, {useEffect, useState} from 'react'
import {Colors} from 'src/utils/constants'
import UploadSpecieIcon from 'assets/images/svg/UploadSpecieIcon.svg'
import PenIcon from 'assets/images/svg/PenIcon.svg'
import BinIcon from 'assets/images/svg/BinIcon.svg'
import {useNavigation} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import {RootStackParamList} from 'src/types/type/navigation.type'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from 'src/store'
import {IScientificSpecies} from 'src/types/interface/app.interface'
import useManageScientificSpecies from 'src/hooks/realm/useManageScientificSpecies'
import {updateImageDetails} from 'src/store/slice/takePictureSlice'
import {SCALE_36} from 'src/utils/constants/spacing'
import {scaleSize} from 'src/utils/constants/mixins'

interface Props {
  item: IScientificSpecies
}

const SpecieInfoImageSection = (props: Props) => {
  const {image} = props.item
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const imageDetails = useSelector((state: RootState) => state.cameraState)
  const {updateSpeciesDetails} = useManageScientificSpecies()
  const [imageId, setImageId] = useState('')
  const dispatch = useDispatch()

  useEffect(() => {
    if (imageId === imageDetails.id && imageId !== '') {
      dispatch(updateImageDetails({id: '', url: ''}))
      updateSpeciesDetails({...props.item, image: imageDetails.url})
    }
  }, [imageDetails])

  const takePicture = () => {
    const newID = String(new Date().getTime())
    setImageId(newID)
    navigation.navigate('TakePicture', {
      id: newID,
      screen: 'SPECIES_INFO',
    })
  }

  const deleteImage = () => {
    updateSpeciesDetails({...props.item, image: ''})
  }

  return (
    <View style={styles.container}>
      {image === '' ? (
        <TouchableOpacity
          style={styles.emptyImageContainer}
          onPress={takePicture}>
          <View style={{alignItems: 'center'}}>
            <UploadSpecieIcon />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: image,
            }}
            style={styles.imageView}
          />
          <View style={styles.imageControls}>
            <TouchableOpacity onPress={takePicture}>
              <View style={[styles.iconContainer, {marginRight: 10}]}>
                <PenIcon width={20} height={20} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={deleteImage}
              style={styles.iconContainer}>
              <BinIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

export default SpecieInfoImageSection

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  emptyImageContainer: {
    height: scaleSize(200),
    backgroundColor: '#EBF3E6',
    borderRadius: 12,
    borderColor: '#86C059',
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scaleSize(10),
  },

  imageContainer: {
    height: scaleSize(280),
    borderRadius: 50,
  },
  imageView: {
    borderRadius: 12,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.TEXT_COLOR,
  },
  imageControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
  },
  iconContainer: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    width: SCALE_36,
    height: SCALE_36,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
