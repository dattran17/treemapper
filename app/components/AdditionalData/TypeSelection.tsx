import CheckBox from '@react-native-community/checkbox';
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '../../styles';

interface ITypeSelectionProps {
  selectedTreeType: any;
  setSelectedTreeType: React.Dispatch<React.SetStateAction<any>>;
  treeTypeError: string;
  selectedRegistrationType: any;
  setSelectedRegistrationType: React.Dispatch<React.SetStateAction<any>>;
  registrationTypeError: string;
}

const treeTypesInitialState = [
  { type: 'single', isSelected: false, isDisabled: true, name: i18next.t('label.single') },
  { type: 'sample', isSelected: false, isDisabled: true, name: i18next.t('label.sample') },
  { type: 'multiple', isSelected: false, isDisabled: true, name: i18next.t('label.multiple') },
];

const registrationTypesInitialState = [
  { type: 'onsite', isSelected: false, isDisabled: false, name: i18next.t('label.on_site') },
  { type: 'offsite', isSelected: false, isDisabled: false, name: i18next.t('label.off_site') },
  { type: 'review', isSelected: false, isDisabled: false, name: i18next.t('label.review') },
];

export default function TypeSelection({
  selectedTreeType,
  setSelectedTreeType,
  treeTypeError,
  selectedRegistrationType,
  setSelectedRegistrationType,
  registrationTypeError,
}: ITypeSelectionProps) {
  const [registrationTypeCheckBoxes, setRegistrationTypeCheckBoxes] = useState<any>(
    registrationTypesInitialState,
  );

  const [treeTypeCheckBoxes, setTreeTypeCheckBoxes] = useState<any>(treeTypesInitialState);

  useEffect(() => {
    setRegistrationTypeCheckBoxes(registrationTypesInitialState);
    setTreeTypeCheckBoxes(treeTypesInitialState);
  }, []);

  const toggleTreeTypeCheckBox = (treeType: string, value: boolean) => {
    const updatedCheckBoxes = treeTypeCheckBoxes.map((tree: any) => {
      if (tree.type === treeType) {
        return {
          ...tree,
          isSelected: value,
        };
      }
      return tree;
    });
    setTreeTypeCheckBoxes(updatedCheckBoxes);

    let treeTypes: any = [];
    for (const tree of updatedCheckBoxes) {
      if (tree.isSelected) {
        treeTypes.push(tree.type);
      }
    }
    setSelectedTreeType(treeTypes);
  };

  console.log('\n\nSelected tree type', selectedTreeType);
  console.log('Selected registration type', selectedRegistrationType);

  const toggleRegistrationTypeCheckBox = (registrationType: string, value: boolean) => {
    const updatedCheckBoxes = registrationTypeCheckBoxes.map((registration: any) => {
      if (registration.type === registrationType) {
        return {
          ...registration,
          isSelected: value,
        };
      }
      return registration;
    });

    setRegistrationTypeCheckBoxes(updatedCheckBoxes);

    let registrationTypes: any = [];
    for (const registration of updatedCheckBoxes) {
      if (registration.isSelected) {
        registrationTypes.push(registration.type);
      }
    }
    setSelectedRegistrationType(registrationTypes);

    console.log('registrationTypes', registrationTypes, registrationTypes.length);

    if (registrationTypes.length === 0) {
      console.log('no registration selected');
      setTreeTypeCheckBoxes(treeTypesInitialState);
      setSelectedTreeType([]);
    } else {
      let updatedTreeBoxes = [...treeTypesInitialState];
      for (const i in updatedTreeBoxes) {
        switch (updatedTreeBoxes[i].type) {
          case 'sample':
            updatedTreeBoxes[i].isSelected = registrationTypes.includes('onsite')
              ? updatedTreeBoxes[i].isSelected
              : false;

            updatedTreeBoxes[i].isDisabled = !registrationTypes.includes('onsite');
            break;
          case 'multiple':
            updatedTreeBoxes[i].isSelected =
              registrationTypes.includes('onsite') || registrationTypes.includes('offsite')
                ? updatedTreeBoxes[i].isSelected
                : false;

            updatedTreeBoxes[i].isDisabled =
              !registrationTypes.includes('onsite') &&
              !registrationTypes.includes('offsite') &&
              registrationTypes.includes('review');
            break;
          case 'single':
            updatedTreeBoxes[i].isSelected =
              !registrationTypes.includes('onsite') &&
              !registrationTypes.includes('offsite') &&
              registrationTypes.includes('review')
                ? true
                : updatedTreeBoxes[i].isSelected;

            updatedTreeBoxes[i].isDisabled =
              !registrationTypes.includes('onsite') &&
              !registrationTypes.includes('offsite') &&
              registrationTypes.includes('review');
            break;
        }
      }
    }
  };

  const checkGroupBoxes: any = [
    {
      title: 'registrationType',
      checkBoxes: registrationTypeCheckBoxes,
      toggleCheckBox: toggleRegistrationTypeCheckBox,
    },
    {
      title: 'treeType',
      checkBoxes: treeTypeCheckBoxes,
      toggleCheckBox: toggleTreeTypeCheckBox,
    },
  ];

  return (
    <>
      {checkGroupBoxes.map(({ title, checkBoxes, toggleCheckBox }: any, index: number) => (
        <View key={`check-box-${index}`}>
          <CheckBoxGroup title={title} checkBoxes={checkBoxes} toggleCheckBox={toggleCheckBox} />
          {title === 'registrationType' && registrationTypeError ? (
            <Text style={styles.errorText}>{registrationTypeError}</Text>
          ) : (
            []
          )}
          {title === 'treeType' && treeTypeError ? (
            <Text style={styles.errorText}>{treeTypeError}</Text>
          ) : (
            []
          )}
        </View>
      ))}
    </>
  );
}

interface ICheckBoxGroupProps {
  title: string;
  checkBoxes: any;
  toggleCheckBox: Function;
}

const CheckBoxGroup = ({ title, checkBoxes, toggleCheckBox }: ICheckBoxGroupProps) => {
  return (
    <>
      <Text style={styles.selectionTypeText}>{i18next.t(`label.${title}`)}</Text>
      <View style={styles.checkBoxParent}>
        {checkBoxes.map((checkBox: any, index: number) => (
          <View style={styles.checkBoxContainer} key={`${checkBox.type}-${index}`}>
            <CheckBox
              disabled={checkBox.isDisabled}
              value={checkBox.isSelected}
              onValueChange={(newValue) => toggleCheckBox(checkBox.type, newValue)}
            />
            <Text style={styles.checkboxText}>{checkBox.name}</Text>
          </View>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  selectionTypeText: {
    color: Colors.TEXT_COLOR,
    fontFamily: Typography.FONT_FAMILY_SEMI_BOLD,
    fontSize: Typography.FONT_SIZE_16,
    marginBottom: 16,
    marginTop: 20,
  },
  checkBoxParent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checkBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
  },
  checkboxText: {
    color: Colors.TEXT_COLOR,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_14,
    marginLeft: 6,
  },
  errorText: {
    color: Colors.ALERT,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_12,
    marginTop: 8,
  },
});
