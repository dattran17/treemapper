import React from 'react'
import {FlashList} from '@shopify/flash-list'
import {scaleSize} from 'src/utils/constants/mixins'
import ManageSpeciesHeader from './ManageSpeciesHeader'
import EmptyManageSpeciesList from './EmptyManageSpeciesList'
import {IScientificSpecies} from 'src/types/interface/app.interface'
import {SpecieCard} from './ManageSpeciesCard'
import {useNavigation} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import {RootStackParamList} from 'src/types/type/navigation.type'
import {useDispatch} from 'react-redux'
import {updateFormSpecies} from 'src/store/slice/registerFormSlice'
import {RegisterFormSliceInitalState} from 'src/types/interface/slice.interface'

const cardSize = scaleSize(60)

interface Props {
  toogleFavSpecies: (item: IScientificSpecies, status: boolean) => void
  userFavSpecies: IScientificSpecies[] | any
  isManageSpecies: boolean
  formData: RegisterFormSliceInitalState | undefined
  showTreeModal: (item: IScientificSpecies) => void
}

const ManageSpeciesHome = (props: Props) => {
  const {
    toogleFavSpecies,
    userFavSpecies,
    isManageSpecies,
    formData,
    showTreeModal,
  } = props
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const dispatch = useDispatch()

  const handleSpeciesPress = (item: IScientificSpecies) => {
    if (!isManageSpecies) {
      dispatch(updateFormSpecies(item.guid))
      if (formData.is_multi_species) {
          showTreeModal(item)
      } else {
        if (formData.tree_details_required) {
          navigation.replace('ReviewTreeDetails')
        } else {
          navigation.navigate('DynamicForm')
        }
      }
    } else {
      navigation.navigate('SpeciesInfo', {guid: item.guid})
    }
  }

  const handleRemoveFav = (item: IScientificSpecies) => {
    toogleFavSpecies(item, false)
  }

  const renderSpecieCard = (item: IScientificSpecies | any, index: number) => {
    return (
      <SpecieCard
        item={item}
        index={index}
        onPressSpecies={handleSpeciesPress}
        actionName={''}
        handleRemoveFavourite={handleRemoveFav}
      />
    )
  }
  return (
    <FlashList
      data={userFavSpecies}
      renderItem={({item, index}) => renderSpecieCard(item, index)}
      estimatedItemSize={cardSize}
      ListHeaderComponent={<ManageSpeciesHeader isManageSecies={isManageSpecies}/>}
      ListEmptyComponent={<EmptyManageSpeciesList />}
    />
  )
}

export default ManageSpeciesHome
