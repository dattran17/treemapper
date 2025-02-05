import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import BackIcon from 'assets/images/svg/BackIcon.svg'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from 'src/types/type/navigation.type'
import { Colors, Typography } from 'src/utils/constants'
import MoreOptionIcon from 'assets/images/svg/MoreOptionIcon.svg'
import { PLOT_COMPLEXITY } from 'src/types/type/app.type'


interface Props {
    showOptions: () => void
    label: string
    type: PLOT_COMPLEXITY
    group: string
}

const PlotDetailsHeader = (props: Props) => {
    const { showOptions, label, type, group } = props;
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
    const goBack = () => {
        navigation.goBack()
    }
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backIcon} onPress={goBack}><BackIcon onPress={goBack} /></TouchableOpacity>
            <View style={styles.sectionWrapper}>
                <Text style={styles.headerLabel}>
                    {label}
                </Text>
                <Text style={styles.noteLabel}>
                    {type === 'STANDARD' ? "Standard" : "Simple"}  {group.length>0?". " + `${group}`:''}
                </Text>
            </View>
            <Pressable style={styles.rightContainer} onPress={showOptions}>
                <MoreOptionIcon onPress={showOptions} />
            </Pressable>
        </View>
    )
}

export default PlotDetailsHeader

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    sectionWrapper: {
        marginLeft: 20,
        flex: 1
    },
    backIcon: {
        width: 20,
        height: 20,
        marginLeft: 20,
    },
    headerLabel: {
        fontFamily: Typography.FONT_FAMILY_BOLD,
        color: Colors.DARK_TEXT_COLOR,
        fontSize: 20
    },
    noteLabel: {
        fontFamily: Typography.FONT_FAMILY_REGULAR,
        color: Colors.TEXT_COLOR,
        fontSize: 15
    },
    rightContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    }
})