import React, { useContext } from 'react';
import i18next from 'i18next';
import { TouchableOpacity, FlatList } from 'react-native';
import InventoryCard from '../InventoryCard';
import { useNavigation } from '@react-navigation/native';
import { InventoryContext } from '../../../reducers/inventory';
import { setInventoryId } from '../../../actions/inventory';
export default function InventoryList({ inventoryList, accessibilityLabel }) {
  const navigation = useNavigation();

  const { dispatch } = useContext(InventoryContext);

  const onPressInventory = (item) => {
    console.log('item.last_screen =>', item);
    setInventoryId(item.inventory_id)(dispatch);
    navigation.navigate(item.last_screen);
  };
  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={inventoryList}
      keyExtractor={(item, index) => `inventory-${index}`}
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
          title =
            `1 ${item.specei_name ? `${item.specei_name} ` : ''}` +
            i18next.t('label.tree_inventory_tree');
          locateTreeAndType += ' - ' + i18next.t('label.tree_inventory_point');
        } else {
          let totalTreeCount = 0;
          let species = Object.values(item.species);

          for (let i = 0; i < species.length; i++) {
            const oneSpecies = species[i];
            totalTreeCount += Number(oneSpecies.treeCount);
          }
          title = `${totalTreeCount} ` + i18next.t('label.tree_inventory_trees');
          locateTreeAndType += ` - ${
            isOffSitePoint
              ? i18next.t('label.tree_inventory_point')
              : i18next.t('label.tree_inventory_polygon')
          }`;
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
            accessibilityLabel={accessibilityLabel}
            testID="upload_inventory_list">
            <InventoryCard icon={'cloud-check'} data={data} />
          </TouchableOpacity>
        );
      }}
    />
  );
}