import { Platform, StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'
import HamburgerIcon from 'assets/images/svg/HamburgerIcon.svg'
import FilterMapIcon from 'assets/images/svg/FilterMapIcon.svg'
import HomeMapIcon from 'assets/images/svg/HomeMapIcon.svg'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from 'src/types/type/navigation.type'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/store'
import useProjectMangement from 'src/hooks/realm/useProjectMangement'
import { getAllProjects, getServerIntervention, getUserSpecies } from 'src/api/api.fetch'
import { updateProjectError, updateProjectState } from 'src/store/slice/projectStateSlice'
import { scaleSize } from 'src/utils/constants/mixins'
import { convertInevtoryToIntervention, getExtendedPageParam } from 'src/utils/helpers/interventionHelper/legacyInventorytoIntervention'
import useInterventionManagement from 'src/hooks/realm/useInterventionManagement'
import { updateLastServerIntervetion, updateServerIntervetion, updateUserSpeciesadded } from 'src/store/slice/appStateSlice'
import useManageScientificSpecies from 'src/hooks/realm/useManageScientificSpecies'

interface Props {
  toogleFilterModal: () => void
  toogleProjectModal: () => void
}

const HomeHeader = (props: Props) => {
  const { addAllProjects } = useProjectMangement()
  const {addUserSpecies} = useManageScientificSpecies()
  const { toogleFilterModal, toogleProjectModal } = props
  const { addNewIntervention } = useInterventionManagement()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const userType = useSelector((state: RootState) => state.userState.type)
  const { lastServerInterventionpage, serverInterventionAdded, userSpecies, isLogedIn } = useSelector((state: RootState) => state.appState)

  const { projectAdded } = useSelector(
    (state: RootState) => state.projectState,
  )

  const dispatch = useDispatch()

  const openHomeDrawer = () => {
    navigation.navigate('HomeSideDrawer')
  }

  useEffect(() => {
    if (userType === 'tpo' && !projectAdded) {
      handleProjects()
    }
  }, [userType, projectAdded])


  useEffect(() => {
    if(!userSpecies && isLogedIn){
      setTimeout(() => {
        syncUserSpecies()
      }, 3000);
    }
  }, [isLogedIn])

  const syncUserSpecies=async()=>{
    try {
      const result = await getUserSpecies()
      if(result && result.length>0){
        const resposne = await addUserSpecies(result)
        if(resposne){
          dispatch(updateUserSpeciesadded(true))
        }
      }
    } catch (error) {
      console.log("error",error)
    }
  }
  

  useEffect(() => {
    if (userType && !serverInterventionAdded) {
      addServerIntervention()
    }
  }, [userType, lastServerInterventionpage])

  const addServerIntervention = async () => {
    try {
      const result = await getServerIntervention(lastServerInterventionpage)
      const interventions = []
      if (result && result.items) {
        if (!result._links.next || result._links.next === result._links.self) {
          dispatch(updateServerIntervetion(true))
          return;
        }
        for (let index = 0; index < result.count; index++) {
          if(result.items[index] && result.items[index].id==='loc_8HnYd9gTXBt108EUALRiEhnp'){
            continue;
          }
          const element = convertInevtoryToIntervention(result.items[index]);
          interventions.push(element)
          await addNewIntervention(element)
        }
        const nextPage = getExtendedPageParam(result._links.next)
        dispatch(updateLastServerIntervetion(nextPage))
      }
    } catch (err) {
      console.log("Error Occured", err)
    }
  } 


  const handleProjects = async () => {
    const response = await getAllProjects()
    if (response) {
      const result = await addAllProjects(response)
      if (result) {
        dispatch(updateProjectState(true))
      } else {
        dispatch(updateProjectError(true))
      }
    }
  }

  return (
    <View style={styles.container}>
      <HamburgerIcon onPress={openHomeDrawer} style={styles.iconWrapper} />
      <View style={styles.sectionWrapper} />
      {userType && userType === 'tpo' ? (
        <>
          <HomeMapIcon
            onPress={toogleProjectModal}
            style={styles.iconWrapper}
          />
          <FilterMapIcon
            onPress={toogleFilterModal}
            style={styles.iconWrapper}
          />
        </>
      ) : null}
    </View>
  )
}

export default HomeHeader

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: scaleSize(70),
    width: '100%',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    top: Platform.OS === 'android' ? 25 : 40,
  },
  iconWrapper: {
    width: 40,
    height: 40,
  },
  sectionWrapper: {
    flex: 1,
  },
  endWrapper: {},
})
