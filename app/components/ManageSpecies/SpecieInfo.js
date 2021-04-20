import { useNetInfo } from '@react-native-community/netinfo';
import { useIsFocused } from '@react-navigation/native';
import i18next from 'i18next';
import React, { useContext, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, CommonStyles } from '_styles';
import { clearSpecie, updateUserSpecie } from '../../actions/species';
import { SpeciesContext } from '../../reducers/species';
import { toggleUserSpecies } from '../../repositories/species';
import { getUserToken } from '../../repositories/user';
import { Camera, Header } from '../Common';
import { updateSpecieData } from './../../repositories/species';

const SpecieInfo = ({ route }) => {
  const [isCamera, setIsCamera] = useState(false);
  const [aliases, setAliases] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [specieName, setSpecieName] = useState('');
  const [specieGuid, setSpecieGuid] = useState('');
  const [specieId, setSpecieId] = useState('');
  // const [editAliases, setEditAliases] = useState('');
  // const [editDescription, setEditDescription] = useState('');
  const [editEnable, setEditEnable] = useState('');
  const { state: specieState, dispatch } = useContext(SpeciesContext);

  const netInfo = useNetInfo();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (specieState.specie) {
      const { specie } = specieState;
      setAliases(specie.aliases);
      setDescription(specie.description);
      setImage(specie.image);

      setSpecieName(specie.scientificName);
      setSpecieGuid(specie.guid);
      setSpecieId(specie.specieId);
    }
  }, [specieState.specie]);

  useEffect(() => {
    if (!isFocused) {
      onSubmitInputField();
      clearSpecie()(dispatch);
    }
  }, [isFocused]);

  const InputModal = () => {
    const [editAliases, setEditAliases] = useState(aliases);
    const [editDescription, setEditDescription] = useState(description);
    return (
      <Modal transparent={true} visible={isOpenModal}>
        <View style={styles.cont}>
          <View style={styles.cont}>
            <View style={styles.cont} />
            <KeyboardAvoidingView
              behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
              style={styles.bgWhite}>
              <View style={CommonStyles.bottomInputContainer}>
                <Text style={CommonStyles.bottomInputLabel}>{editEnable ? editEnable : null}</Text>
                <TextInput
                  value={
                    editEnable === 'aliases'
                      ? editAliases
                      : editEnable === 'description'
                      ? editDescription
                      : null
                  }
                  style={CommonStyles.bottomInputText}
                  autoFocus
                  placeholderTextColor={Colors.TEXT_COLOR}
                  // keyboardType={editEnable === 'tagId' ? 'default' : 'decimal-pad'}
                  onChangeText={(text) => {
                    if (editEnable === 'aliases') {
                      setEditAliases(text);
                    } else if (editEnable === 'description') {
                      setEditDescription(text);
                    }
                  }}
                  onSubmitEditing={() => {
                    onSubmitInputField(editAliases, editDescription);
                    setIsOpenModal(false);
                  }}
                />
                <MCIcon
                  onPress={() => {
                    onSubmitInputField(editAliases, editDescription);
                    setIsOpenModal(false);
                  }}
                  name={'arrow-right'}
                  size={30}
                  color={Colors.PRIMARY}
                />
              </View>
              <SafeAreaView />
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    );
  };

  const onSubmitInputField = (aliases, description) => {
    setAliases(aliases);
    setDescription(description);
    const isImageChanged = specieState.specie.image !== image;
    const isDescriptionChanged = specieState.specie.description !== description;
    const isAliasesChanged = specieState.specie.aliases !== aliases;
    const shouldUpdateData = isImageChanged || isDescriptionChanged || isAliasesChanged;

    if (shouldUpdateData) {
      updateSpecieData({
        scientificSpecieGuid: specieGuid,
        aliases,
        description,
        image,
      })
        .then(async () => {
          const userToken = await getUserToken();
          if (netInfo.isConnected && netInfo.isInternetReachable && specieId && userToken) {
            updateUserSpecie({
              scientificSpecieGuid: specieGuid,
              specieId: specieId,
              aliases,
              description,
              image: image ? image : null,
            });
          }
        })
        .catch((err) => {
          console.error('something went wrong', err);
        });
    }
  };

  const handleCamera = ({ base64Image }) => {
    setIsCamera(!isCamera);
    setImage(`data:image/jpeg;base64,${base64Image}`);
  };

  const CheckIcon = () => {
    const [isUserSpecies, setIsUserSpecies] = useState(true);
    return (
      <TouchableOpacity
        onPress={() => {
          toggleUserSpecies(specieGuid);
          setIsUserSpecies(!isUserSpecies);
        }}>
        {isUserSpecies ? (
          <Ionicons
            name={'ios-checkmark-circle-sharp'}
            size={30}
            style={{ color: Colors.PRIMARY }}
          />
        ) : (
          <MaterialCommunityIcons
            name={'checkbox-blank-circle-outline'}
            size={30}
            style={{ color: Colors.GRAY_MEDIUM }}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (isCamera) {
    return <Camera handleCamera={handleCamera} />;
  } else {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.container}>
          <Header
            headingTextInput={aliases}
            TitleRightComponent={CheckIcon}
            setHeadingText={setAliases}
            onSubmitInputField={onSubmitInputField}
            onFocusFunction={() => {
              setEditEnable('aliases');
              setIsOpenModal(true);
            }}
          />
          <ScrollView showsVerticalScrollIndicator={false}>
            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'}>
              {!image ? (
                <TouchableOpacity
                  style={styles.emptyImageContainer}
                  onPress={() => setIsCamera(true)}>
                  <View>
                    <Ionicons
                      name={'md-cloud-upload-outline'}
                      style={styles.uploadIcon}
                      size={80}
                      color={Colors.GRAY_LIGHTEST}
                    />
                    <Text style={styles.addImage}>{i18next.t('label.add_image')}</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.imageContainer}>
                  <Image
                    source={{
                      uri: `${image}`,
                    }}
                    style={styles.imageView}
                  />
                  <View style={styles.imageControls}>
                    <TouchableOpacity onPress={() => setIsCamera(true)}>
                      <View style={[styles.iconContainer, { marginRight: 10 }]}>
                        <FA5Icon name={'pen'} size={16} color={Colors.GRAY_LIGHTEST} />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setImage('')}>
                      <View style={styles.iconContainer}>
                        <FAIcon name={'trash'} size={18} color={Colors.GRAY_LIGHTEST} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              <View style={{ flex: 1, flexDirection: 'column', marginBottom: 30 }}>
                <Text style={styles.infoCardHeading}>{i18next.t('label.species_name')}</Text>
                <Text style={styles.infoCardText}>{specieName}</Text>
                <Text style={styles.infoCardHeading}>{i18next.t('label.species_description')}</Text>
                {/* <TextInput
                  style={[styles.infoCardText, { padding: 0 }]}
                  placeholder={i18next.t('label.type_description_here')}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                  maxLength={255}
                  onSubmitEditing={onSubmitInputField}
                  onFocus={() => {
                    setEditEnable('description');
                    setIsOpenModal(true);
                  }}
                /> */}
                <TouchableOpacity
                  onPress={() => {
                    setEditEnable('description');
                    setIsOpenModal(true);
                  }}>
                  <Text style={[styles.infoCardText, { padding: 0 }]}>{description}</Text>
                </TouchableOpacity>
              </View>
              <InputModal />
            </KeyboardAvoidingView>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
    backgroundColor: Colors.WHITE,
  },
  cont: {
    flex: 1,
  },
  bgWhite: {
    backgroundColor: Colors.WHITE,
  },
  emptyImageContainer: {
    marginTop: 25,
    height: 180,
    backgroundColor: Colors.GRAY_LIGHT,
    borderRadius: 6,
    borderColor: Colors.GRAY_LIGHTEST,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImage: {
    fontFamily: Typography.FONT_FAMILY_SEMI_BOLD,
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.PRIMARY,
  },
  infoCardHeading: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_12,
    paddingTop: 25,
  },
  infoCardText: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_18,
    paddingTop: 5,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 50,
    marginTop: 25,
    // height: Dimensions.get('window').height * 0.4,
  },
  imageView: {
    borderRadius: 8,
    resizeMode: 'cover',
    width: '100%',
    height: Dimensions.get('window').height * 0.4,
    backgroundColor: Colors.TEXT_COLOR,
  },
  imageControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
  },
  iconContainer: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SpecieInfo;
