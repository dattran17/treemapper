import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { FlatList } from 'react-native'
import { MonitoringPlot, PlotGroups } from 'src/types/interface/slice.interface'
import { formatRelativeTimeCustom } from 'src/utils/helpers/appHelper/dataAndTimeHelper'
import { useObject } from '@realm/react'
import { RealmSchema } from 'src/types/enum/db.enum'
import { Typography, Colors } from 'src/utils/constants'
import BinIcon from 'assets/images/svg/BinIcon.svg'
import useMonitoringPlotMangement from 'src/hooks/realm/useMonitoringPlotMangement'
import i18next from 'src/locales/index'

interface Props {
    gid
}

const GrouplistPlot = ({ gid }: Props) => {
    const plotDetails = useObject<PlotGroups>(
        RealmSchema.PlotGroups, gid
    )

    const { removePlotFromGroup } = useMonitoringPlotMangement()

    const handleRemoval = async (id: string) => {
        await removePlotFromGroup(gid, id)
    }

    const renderCardItems = (item: MonitoringPlot, index: number) => {
        return (<View style={[styles.cardWrapper, { borderBottomWidth: index < plotDetails.plots.length - 1 ? 0.5 : 0 }]}>
            <View style={styles.sectionWrapper}>
                <Text style={styles.cardheader}>{item.name}</Text>
                <Text style={styles.cardLabel}>{item.observations.length} observations | last updated {formatRelativeTimeCustom(item.plot_updated_at)}</Text>
            </View>
            <Pressable style={styles.checkBoxWrapper} onPress={() => { handleRemoval(item.plot_id) }}>
                <BinIcon width={18} height={18} fill={Colors.TEXT_COLOR} onPress={() => { handleRemoval(item.plot_id) }} />
            </Pressable>
        </View>)
    }


    return (
        <View style={styles.container}>
            <View style={styles.wrapper}>
                <FlatList
                    style={[styles.flatlistWrapper, { backgroundColor: plotDetails.plots.length > 0 ? Colors.WHITE : 'transparent' }]}
                    ListEmptyComponent={() => {
                        return (
                            <View style={styles.emptyWrapper}>
                                <Text style={styles.emptyLabel}>
                                    {i18next.t('label.empty_plots_note')}
                                </Text>
                            </View>
                        )
                    }}
                    data={plotDetails.plots}
                    renderItem={({ item, index }) => renderCardItems(item, index)} />
            </View>
        </View>
    )
}

export default GrouplistPlot

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.BACKDROP_COLOR,
        alignItems: 'center'
    },
    wrapper: {
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        maxHeight: '90%',
    },
    flatlistWrapper: {
        marginTop: 50,
        width: '98%',
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: Colors.WHITE
    },
    emptyWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyLabel: {
        fontSize: 16,
        fontFamily: Typography.FONT_FAMILY_SEMI_BOLD,
        color: Colors.TEXT_LIGHT,
        width: '100%',
        textAlign: 'center',
        letterSpacing: 1
    },
    cardWrapper: {
        width: '94%',
        flexDirection: "row",
        alignItems: 'center',
        marginLeft: '3%',
        paddingHorizontal: 10,
        borderBottomWidth: 0.5,
        borderColor: Colors.GRAY_LIGHT,
        paddingVertical: 10,
        paddingBottom: 15

    },
    sectionWrapper: {
        flex: 14,
    },
    cardheader: {
        fontSize: 16,
        fontFamily: Typography.FONT_FAMILY_SEMI_BOLD,
        color: Colors.TEXT_COLOR,
        letterSpacing: 0.4
    },
    cardLabel: {
        fontSize: 12,
        fontFamily: Typography.FONT_FAMILY_REGULAR,
        color: Colors.TEXT_LIGHT,
        letterSpacing: 0.4
    },
    checkBoxWrapper: {
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: "center",
        backgroundColor: Colors.GRAY_LIGHT,
        borderRadius: 8
    }
})