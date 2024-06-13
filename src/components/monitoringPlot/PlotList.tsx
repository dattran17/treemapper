import React from 'react'
import { FlashList } from '@shopify/flash-list'
import PlotCards from './PlotCards'
import { StyleSheet } from 'react-native'
import { Colors } from 'src/utils/constants'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from 'src/types/type/navigation.type'

interface Props {
    data: any
}

const PlotList = (props: Props) => {
    const { data } = props
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
    const handleSelection = () => {
        navigation.navigate('AddRemeasurment')
    }
    return (
        <FlashList
            renderItem={({ item }) => (<PlotCards item={item} handleSelection={handleSelection} />)}
            data={data} estimatedItemSize={100}
            contentContainerStyle={styles.container}
        />
    )
}

export default PlotList

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.BACKDROP_COLOR,
        paddingTop: 20
    }
})

