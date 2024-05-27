import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { scaleFont } from 'src/utils/constants/mixins'
import { Colors, Typography } from 'src/utils/constants'
import { timestampToBasicDate } from 'src/utils/helpers/appHelper/dataAndTimeHelper'
import SingleTreeIcon from 'assets/images/svg/RoundTreeIcon.svg'
import { SCALE_36, SCALE_56 } from 'src/utils/constants/spacing'
import InterventionIconSwitch from '../intervention/InterventionIconSwitch'

interface Props {
  data: any
  onPress: ((id: string, tree_id?: string)=>void)
}

const CarouselItem = (props: Props) => {
  const { data, onPress } = props
  if(data && data.tree_type){
    const uri  = data.cdn_image_url?`https://cdn.plant-for-the-planet.org/media/cache/coordinate/large/${data.cdn_image_url}`: data.image_url
    const hasImage = uri.length>0
    return <TouchableOpacity style={styles.container} onPress={()=>{
      onPress(data.intervention_id, data.tree_id)
    }}>
      <View style={styles.imageWrapper}>
        {hasImage?<Image style={styles.imageContainer} source={{uri:uri}}/>:        <SingleTreeIcon width={SCALE_36} height={SCALE_36} />
}
      </View>
      <View style={styles.sectionWrapper}>
        <Text style={styles.sectionLabel}>Species Name</Text>
        <Text style={styles.speciesName} ellipsizeMode="tail">
          {data.specie_name}
        </Text>
        <Text style={styles.sectionLabel}>Intevetion Date</Text>
        <Text style={styles.vauleLabel}>
          {timestampToBasicDate(data.plantation_date)}
        </Text>
      </View>
    </TouchableOpacity>
  }else{
    const hasImage =  data.cover_image_url.length>0
    return <TouchableOpacity style={styles.container} onPress={()=>{
      onPress(data.intervention_id)
    }}>
      <View style={styles.imageWrapper}>
      {hasImage?<Image style={styles.imageContainer} source={{uri: data.cover_image_url}}/>:          <InterventionIconSwitch icon={data.intervention_key} dimension={SCALE_56} />
}
      </View>
      <View style={styles.sectionWrapper}>
        <Text style={styles.sectionLabel}>Intervention</Text>
        <Text style={styles.itLabel} ellipsizeMode="tail">
          {data.intervention_title}
        </Text>
        <Text style={styles.sampleLabel}>Show More Details</Text>
        
      </View>
    </TouchableOpacity>
  }
}

export default CarouselItem

const styles = StyleSheet.create({
  container: {
    width: '95%',
    height: 150,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
  },
  imageWrapper: {
    width: '35%',
    height: '80%',
    backgroundColor: Colors.NEW_PRIMARY + '1A',
    marginLeft: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer:{
    width:'98%',
    height:'98%',
    borderRadius: 20,
    borderWidth:2,
    borderColor: Colors.NEW_PRIMARY + '1A',
  },
  imageUrl: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },

  sectionWrapper: {
    marginLeft: '5%',
    justifyContent: 'center',
  },
  speciesName: {
    fontSize: scaleFont(14),
    fontFamily: Typography.FONT_FAMILY_ITALIC,
    color: Colors.TEXT_COLOR,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: scaleFont(14),
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    color: Colors.TEXT_LIGHT,
  },
  vauleLabel: {
    fontSize: scaleFont(14),
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    color: Colors.TEXT_COLOR,
    marginBottom: 10,
  },
  itLabel:{
    fontSize: scaleFont(14),
    fontFamily: Typography.FONT_FAMILY_SEMI_BOLD,
    color: Colors.TEXT_LIGHT,
    marginBottom:5
  },
  sampleLabel: {
    fontSize: scaleFont(14),
    fontFamily: Typography.FONT_FAMILY_SEMI_BOLD,
    color: Colors.NEW_PRIMARY,
  }
})
