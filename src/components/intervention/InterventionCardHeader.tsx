import { StyleSheet, Text } from 'react-native'
import React from 'react'

import { SCALE_50 } from 'src/utils/constants/spacing'
import { InterventionData } from 'src/types/interface/slice.interface'
import { Colors, Typography } from 'src/utils/constants'
import { scaleFont } from 'src/utils/constants/mixins'

interface Props {
  item: InterventionData
}

const InterventionCardHeader = (props: Props) => {
  const { item } = props

  const totalTressCount = () => {
    const data = {
    }
    item.sample_trees.forEach(element => {
      data[element.species_guid] = element.count
    })
    let finalCount = 0;
    for (const key in data) {
      finalCount += data[key]
    }
    return finalCount

  }

  switch (item.intervention_type) {
    case 'fire-suppression':
      return <Text style={styles.label}>Fire Supression Team</Text>
    case 'grass-suppression':
      return <Text style={styles.label}>8 Trees Planted</Text>
    case 'fencing':
      return <Text style={styles.label}>Assited Seed Rain</Text>
    case 'direct-seeding':
      return <Text style={styles.label}>8 Trees Planted</Text>
    case 'multi-tree-registration':
      return <Text style={styles.label}>{totalTressCount()} Trees Planted</Text>
    case 'single-tree-registration':
      return <Text style={styles.label}>Single Tree Planted</Text>
    case 'soil-improvement':
      return (
        <Text style={styles.label}>
          Single Tree Planted({item.sample_trees[0].specie_name})
        </Text>
      )
    default:
      return <Text style={styles.label}></Text>
  }
}

export default InterventionCardHeader

const styles = StyleSheet.create({
  iconWrapper: {
    borderRadius: 10,
    marginLeft: 10,
    width: SCALE_50,
    height: SCALE_50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: scaleFont(16),
    fontFamily: Typography.FONT_FAMILY_SEMI_BOLD,
    color: Colors.TEXT_COLOR,
    marginBottom: 5,
  },
})
