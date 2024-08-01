import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Colors, Typography } from 'src/utils/constants';
import CustomButton from '../common/CustomButton';
import { scaleSize } from 'src/utils/constants/mixins';
import IntensitySelector from './IntensitySelector';
import { AvoidSoftInput, AvoidSoftInputView } from 'react-native-avoid-softinput';

interface Props {
  intensity: any;
}

const Intensity: React.FC<Props> = ({ intensity }) => {
  const [selectedIntensity, setSelectedIntensity] = useState(intensity);

  useEffect(() => {
    AvoidSoftInput.setShouldMimicIOSBehavior(true);
    return () => {
      AvoidSoftInput.setShouldMimicIOSBehavior(false);
    };
  }, []);

  useEffect(() => {
    if (intensity) {
      setSelectedIntensity(intensity);
    }
  }, [intensity]);

  return (
    <AvoidSoftInputView avoidOffset={0} style={{ flex: 1 }}>
      <View style={[styles.scene, styles.defaultSpacing]}>
        <ScrollView style={styles.scrollView}>
          <Text style={[styles.description, styles.descriptionMarginTop]}>
            {i18next.t('label.select_intensity_for_remeasurement')}
          </Text>
          <IntensitySelector
            selectedIntensity={selectedIntensity}
            setSelectedIntensity={setSelectedIntensity}
          />
        </ScrollView>
        <View style={styles.buttonContainer}>
          <CustomButton
            label={i18next.t('label.save')}
            containerStyle={styles.btnContainer}
            pressHandler={() => {}}
          />
        </View>
      </View>
    </AvoidSoftInputView>
  );
};

export default Intensity;

const styles = StyleSheet.create({
  scene: {
    flex: 1,
  },
  defaultSpacing: {
    paddingTop: 10,
  },
  scrollView: {
    paddingHorizontal: 25,
  },
  description: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: 16,
    color: Colors.TEXT_COLOR,
  },
  descriptionMarginTop: {
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 25,
  },
  btnContainer: {
    width: '100%',
    height: scaleSize(70),
    position: 'absolute',
    bottom: 50,
  },
});
