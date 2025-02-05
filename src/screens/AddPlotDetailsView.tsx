import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from 'src/components/common/Header'
import { Colors, Typography } from 'src/utils/constants'
import CustomButton from 'src/components/common/CustomButton'
import OutlinedTextInput from 'src/components/common/OutlinedTextInput'
import InterventionDatePicker from 'src/components/formBuilder/InterventionDatePicker'
import CustomDropDown from 'src/components/common/CustomDropDown'
import i18next from 'src/locales/index'

const AddPlotDetailsView = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header label='Add Details' />
      <ScrollView>
        <View style={styles.wrapper}>
          <View style={styles.inputWrapper}>
            <OutlinedTextInput
              placeholder={`${i18next.t("local.plant_tree_count")}`}
              changeHandler={() => { }}
              keyboardType={'decimal-pad'}
              trailingText={'trees'} errMsg={''} />
            <Text style={styles.note}>{i18next.t('label.how_many_trees')}</Text>
          </View>
          <View style={styles.inputWrapper}>
            <OutlinedTextInput
              placeholder={`${i18next.t("local.existing_count")}`}
              changeHandler={() => { }}
              keyboardType={'decimal-pad'}
              trailingText={'trees'} errMsg={''} />
            <Text style={styles.note}>{i18next.t('label.how_many_trees')}</Text>
            </View>
          <View style={styles.inputWrapper}>
            <OutlinedTextInput
              placeholder={'name_of_tree'}
              changeHandler={() => { }}
              keyboardType={'decimal-pad'}
              trailingText={'trees'} errMsg={''} />
          </View>
          <View style={styles.inputWrapper}>
            <OutlinedTextInput
              placeholder={`${i18next.t("local.shrub_count")}`}
              changeHandler={() => { }}
              keyboardType={'decimal-pad'}
              trailingText={'shrubs'} errMsg={''} />
          </View>
          <View style={styles.inputWrapper}>
            <OutlinedTextInput
              placeholder={`${i18next.t("local.canopy_cover")}`}
              changeHandler={() => { }}
              keyboardType={'decimal-pad'}
              trailingText={'%'} errMsg={''} />
          </View>
          <View style={styles.inputWrapper}>
            <OutlinedTextInput
              placeholder={`${i18next.t("local.stump_count")}`}
              changeHandler={() => { }}
              keyboardType={'decimal-pad'}
              trailingText={'stumps'} errMsg={''} />
          </View>
          <InterventionDatePicker
            placeHolder={'Measurement Date'}
            value={Date.now()}
            callBack={() => { }}
          />
          <View style={styles.dropDownWrapper}>
            <CustomDropDown
              label={'Site'}
              data={[{
                label: '',
                value: 'el.id',
                index: 0,
              }]}
              onSelect={() => null}
              selectedValue={{
                label: 'InterventionFormData.site_name',
                value: 'InterventionFormData.site_id,,',
                index: 0,
              }}
            />
          </View>
          <View style={styles.inputWrapper}>
            <OutlinedTextInput
              placeholder={'Height'}
              changeHandler={() => { }}
              keyboardType={'decimal-pad'}
              trailingText={'m'} errMsg={''} />
          </View>
          <View style={styles.inputWrapper}>
            <OutlinedTextInput
              placeholder={'Further Information'}
              changeHandler={() => { }}
              keyboardType={'decimal-pad'}
              trailingText={'m'} errMsg={''} />
          </View>
        </View>
      </ScrollView>
      <CustomButton
        label="Save"
        containerStyle={styles.btnContainer}
        pressHandler={() => { }}
        hideFadeIn
      />
    </SafeAreaView>
  )
}

export default AddPlotDetailsView

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE
  },
  wrapper: {
    flex: 1,
    backgroundColor: Colors.BACKDROP_COLOR,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom:100
  },
  inputWrapper: {
    width: '95%',
  },
  btnContainer: {
    width: '100%',
    height: 70,
    position: 'absolute',
    bottom: 20,
  },
  dropDownWrapper: {
    width: '98%'
  },
  note: {
    fontSize: 14,
    fontFamily: Typography.FONT_FAMILY_ITALIC,
    color: Colors.TEXT_LIGHT,
    marginLeft: '5%',
    marginBottom: 10
  }
})