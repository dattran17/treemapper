import { useNavigation } from '@react-navigation/native';
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Realm from 'realm';
import { Colors, Typography } from '_styles';
import { getSchema } from '../../repositories/default';
import dbLog from '../../repositories/logs';
// import { addMultipleTreesSpecie, setSpecieId } from '../../actions/species';
import { getUserSpecies, searchSpeciesFromLocal } from '../../repositories/species';
import { LogTypes } from '../../utils/constants';
import { Header } from '../Common';
import MySpecies from './MySpecies';
import SearchSpecies from './SearchSpecies';

const DismissKeyBoard = ({ children }) => {
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      {children}
    </TouchableWithoutFeedback>
  );
};

const ManageSpecies = ({
  onPressSpeciesSingle,
  onPressBack,
  onPressSpeciesMultiple,
  registrationType,
  onSaveMultipleSpecies,
  addSpecieNameToInventory,
  editOnlySpecieName,
}) => {
  const navigation = useNavigation();
  const [specieList, setSpecieList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchList, setSearchList] = useState([]);
  const [showSearchSpecies, setShowSearchSpecies] = useState(false);

  useEffect(() => {
    // fetches all the species already added by user when component mount
    getUserSpecies().then((userSpecies) => {
      if (registrationType) {
        let specieListWithUnknown = [];
        if (userSpecies && userSpecies.length > 0) {
          specieListWithUnknown = [
            ...userSpecies,
            {
              guid: 'unknown',
              isUserSpecies: true,
              scientific_name: i18next.t('label.select_species_unknown'),
            },
          ];
        } else {
          specieListWithUnknown = [
            {
              guid: 'unknown',
              isUserSpecies: true,
              scientific_name: i18next.t('label.select_species_unknown'),
            },
          ];
        }
        setSpecieList(specieListWithUnknown);
      } else {
        setSpecieList(userSpecies);
      }
    });
  }, [registrationType, searchList]);

  useEffect(() => {
    if (searchText) {
      setShowSearchSpecies(true);
    } else {
      setShowSearchSpecies(false);
    }
  }, [searchText]);

  // used to navigate to main screen
  const onPressHome = () => {
    navigation.navigate('MainScreen');
  };

  // This function adds or removes the specie from User Species
  // ! Do not move this function to repository as state change is happening here to increase the performance
  const toggleUserSpecies = (guid, add) => {
    return new Promise((resolve) => {
      Realm.open(getSchema())
        .then((realm) => {
          realm.write(() => {
            let specieToToggle = realm.objectForPrimaryKey('ScientificSpecies', guid);
            if (add) {
              specieToToggle.isUserSpecies = true;
            } else {
              specieToToggle.isUserSpecies = !specieToToggle.isUserSpecies;
            }
            // copies the current search list in variable currentSearchList
            const currentSearchList = [...searchList];

            // sets the changes done by realm into the state
            setSearchList(currentSearchList);

            // logging the success in to the db
            dbLog.info({
              logType: LogTypes.MANAGE_SPECIES,
              message: `Specie with guid ${guid} is toggled ${
                specieToToggle.isUserSpecies ? 'on' : 'off'
              }`,
            });
          });
          resolve();
        })
        .catch((err) => {
          console.error(`Error at /components/ManageSpecies/index, ${JSON.stringify(err)}`);
          // logging the error in to the db
          dbLog.error({
            logType: LogTypes.MANAGE_SPECIES,
            message: `Error while adding or removing specie from user specie for specie id: ${guid}`,
            logStack: JSON.stringify(err),
          });
        });
    });
  };

  //This function handles search whenever any search text is entered
  const handleSpeciesSearch = (text) => {
    setSearchText(text);
    if (text) {
      setShowSearchSpecies(true);
      searchSpeciesFromLocal(text).then((data) => {
        setSearchList([...data]);
      });
    } else {
      setShowSearchSpecies(false);
      setSearchList([]);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <DismissKeyBoard>
        <View style={styles.container}>
          <Header
            closeIcon
            onBackPress={onPressBack ? onPressBack : onPressHome}
            headingText={
              registrationType ? i18next.t('label.select_species_header') : 'Tree Species'
            }
          />
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} style={styles.searchIcon} />
            <TextInput
              style={styles.searchText}
              placeholder={i18next.t('label.select_species_search_species')}
              onChangeText={handleSpeciesSearch}
              value={searchText}
              returnKeyType={'search'}
              autoCorrect={false}
            />
            {searchText ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchText('');
                }}>
                <Ionicons name="md-close" size={20} style={styles.closeIcon} />
              </TouchableOpacity>
            ) : (
              []
            )}
          </View>
          {showSearchSpecies ? (
            searchList && searchList.length > 0 ? (
              <SearchSpecies
                searchList={searchList}
                registrationType={registrationType}
                onPressSpeciesSingle={onPressSpeciesSingle}
                onPressSpeciesMultiple={onPressSpeciesMultiple}
                toggleUserSpecies={toggleUserSpecies}
                addSpecieNameToInventory={addSpecieNameToInventory}
                editOnlySpecieName={editOnlySpecieName}
                onPressBack={onPressBack}
                clearSearchText={() => setSearchText('')}
              />
            ) : (
              <Text style={styles.notPresentText}>
                The &apos;{searchText}&apos; specie is not present
              </Text>
            )
          ) : (
            <MySpecies
              onSaveMultipleSpecies={onSaveMultipleSpecies}
              registrationType={registrationType}
              onPressSpeciesSingle={onPressSpeciesSingle}
              onPressSpeciesMultiple={onPressSpeciesMultiple}
              specieList={specieList}
              addSpecieNameToInventory={addSpecieNameToInventory}
              editOnlySpecieName={editOnlySpecieName}
              onPressBack={onPressBack}
            />
          )}
        </View>
      </DismissKeyBoard>
    </SafeAreaView>
  );
};

export default ManageSpecies;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    backgroundColor: Colors.WHITE,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    // borderWidth: 1,
    height: 48,
    borderRadius: 5,
    marginTop: 24,
    backgroundColor: Colors.WHITE,
    // borderColor: '#00000024',
    shadowColor: '#00000024',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.39,
    shadowRadius: 8.3,
    elevation: 6,
  },
  searchIcon: {
    color: '#949596',
    paddingLeft: 19,
  },
  searchText: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    fontSize: Typography.FONT_SIZE_14,
    paddingLeft: 12,
    flex: 1,
  },
  specieListItem: {
    paddingVertical: 20,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderColor: '#E1E0E061',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notPresentText: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    fontSize: Typography.FONT_SIZE_14,
    paddingVertical: 20,
    alignSelf: 'center',
  },
  closeIcon: {
    justifyContent: 'flex-end',
    color: Colors.TEXT_COLOR,
    paddingRight: 20,
  },
});