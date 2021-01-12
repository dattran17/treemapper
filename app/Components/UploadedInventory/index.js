import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Header, InventoryCard, PrimaryButton, AlertModal } from '../Common';
import { SafeAreaView } from 'react-native';
import { getAllInventoryByStatus, clearAllUploadedInventory } from '../../Actions';
import { store } from '../../Actions/store';
import { Colors, Typography } from '_styles';
import { LocalInventoryActions } from '../../Actions/Action';
import { empty_inventory_banner } from '../../assets';
import { SvgXml } from 'react-native-svg';
import i18next from 'i18next';

const UploadedInventory = ({ navigation }) => {
  const { dispatch } = useContext(store);

  const [allInventory, setAllInventory] = useState(null);
  const [isShowFreeUpSpaceAlert, setIsShowFreeUpSpaceAlert] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      initialState();
    });

    return unsubscribe;
  }, [navigation]);

  const initialState = () => {
    getAllInventoryByStatus('complete').then((allInventory) => {
      setAllInventory(Object.values(allInventory));
    });
  };

  const onPressInventory = (item) => {
    setTimeout(() => {
      dispatch(LocalInventoryActions.setInventoryId(item.inventory_id));
      navigation.navigate(item.last_screen);
    }, 0);
  };

  const freeUpSpace = () => {
    clearAllUploadedInventory().then(() => {
      initialState();
      toogleIsShowFreeUpSpaceAlert();
    });
  };

  const toogleIsShowFreeUpSpaceAlert = () => {
    setIsShowFreeUpSpaceAlert(!isShowFreeUpSpaceAlert);
  };

  const renderInventoryList = (inventoryList) => {
    return (
      <FlatList
        showsVerticalScrollIndicator={false}
        data={inventoryList}
        renderItem={({ item }) => {
          let imageURL;
          let isOffSitePoint = false;
          if (
            item.polygons[0] &&
            item.polygons[0].coordinates &&
            Object.values(item.polygons[0].coordinates).length
          ) {
            imageURL = item.polygons[0].coordinates[0].imageUrl;
            isOffSitePoint = Object.values(item.polygons[0].coordinates).length == 1;
          }
          let locateTreeAndType = '';
          let title = '';
          if (item.locate_tree === 'off-site') {
            locateTreeAndType = i18next.t('label.tree_inventory_off_site');
          } else {
            locateTreeAndType = i18next.t('label.tree_inventory_on_site');
          }
          if (item.tree_type == 'single') {
            title = `1 ${item.specei_name ? `${item.specei_name} ` : ''}` + i18next.t('label.tree_inventory_tree');
            locateTreeAndType += ' - ' + i18next.t('label.tree_inventory_point');
          } else {
            let totalTreeCount = 0;
            let species = Object.values(item.species);

            for (let i = 0; i < species.length; i++) {
              const oneSpecies = species[i];
              totalTreeCount += Number(oneSpecies.treeCount);
            }
            title = `${totalTreeCount} ` + i18next.t('label.tree_inventory_trees');
            locateTreeAndType += ` - ${isOffSitePoint ? i18next.t('label.tree_inventory_point') : i18next.t('label.tree_inventory_polygon')}`;
          }
          let data = {
            title: title,
            subHeading: locateTreeAndType,
            date: i18next.t('label.inventory_overview_date', {
              date: new Date(Number(item.plantation_date)),
            }),
            imageURL: imageURL,
          };

          return (
            <TouchableOpacity
              onPress={() => onPressInventory(item)}
              accessible={true}
              accessibilityLabel={i18next.t('label.tree_inventory_upload_inventory_list')}
              testID="upload_inventory_list">
              <InventoryCard icon={'cloud-check'} data={data} />
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  const renderInventory = () => {
    return (
      <View style={styles.cont}>
        {allInventory.length > 0 && (
          <>
            <TouchableOpacity
              onPress={toogleIsShowFreeUpSpaceAlert}
              accessible={true}
              accessibilityLabel={i18next.t('label.tree_inventory_free_up_space')}
              testID="free_up_space">
              <Text style={styles.freeUpSpace}>{i18next.t('label.tree_inventory_free_up_space')}</Text>
            </TouchableOpacity>
            {renderInventoryList(allInventory)}
          </>
        )}
      </View>
    );
  };

  const renderLoadingInventoryList = () => {
    return (
      <View style={styles.cont}>
        <Header
          headingText={i18next.t('label.tree_inventory_upload_list_header')}
          style={{ marginHorizontal: 25 }}
        />
        <ActivityIndicator size={25} color={Colors.PRIMARY} />
      </View>
    );
  };

  const renderEmptyInventoryList = () => {
    return (
      <View style={styles.cont}>
        <Header
          headingText={i18next.t('label.tree_inventory_upload_list_header')}
          style={{ marginHorizontal: 25 }}
        />
        <SvgXml xml={empty_inventory_banner} style={styles.emptyInventoryBanner} />
        <View style={styles.parimaryBtnCont}>
          <PrimaryButton
            onPress={() => navigation.navigate('TreeInventory')}
            btnText={i18next.t('label.tree_inventory_upload_empty_btn_text')}
          />
        </View>
      </View>
    );
  };

  const renderInventoryListContainer = () => {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Header headingText={i18next.t('label.tree_inventory_upload_list_header')} />
          {renderInventory()}
        </ScrollView>
        <SafeAreaView />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <SafeAreaView />
      {allInventory && allInventory.length > 0
        ? renderInventoryListContainer()
        : allInventory == null
        ? renderLoadingInventoryList()
        : renderEmptyInventoryList()}
      <AlertModal
        visible={isShowFreeUpSpaceAlert}
        heading={i18next.t('label.tree_inventory_alert_header')}
        message={i18next.t('label.tree_inventory_alert_sub_header')}
        primaryBtnText={i18next.t('label.tree_inventory_alert_primary_btn_text')}
        secondaryBtnText={i18next.t('label.alright_modal_white_btn')}
        onPressPrimaryBtn={freeUpSpace}
        onPressSecondaryBtn={toogleIsShowFreeUpSpaceAlert}
      />
    </View>
  );
};
export default UploadedInventory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    backgroundColor: Colors.WHITE,
  },
  cont: {
    flex: 1,
  },
  emptyInventoryBanner: {
    width: '109%',
    height: '80%',
    marginHorizontal: -5,
    bottom: -10,
  },
  parimaryBtnCont: {
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    bottom: 10,
    paddingHorizontal: 25,
  },
  freeUpSpace: {
    color: Colors.PRIMARY,
    fontFamily: Typography.FONT_FAMILY_SEMI_BOLD,
    fontSize: Typography.FONT_SIZE_18,
    lineHeight: Typography.LINE_HEIGHT_30,
    textAlign: 'center',
    marginVertical: 10,
  },
});
