import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useRef, useState } from 'react';
import { SvgXml } from 'react-native-svg';
import { add_icon, ListIcon, PlotIcon, MapExplore } from '../../assets';
import { GradientText } from '../Common';
import { Colors, Spacing, Typography } from '../../styles';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';
import AddOptionsModal from './AddOptionsModal';

const AnimatedTextInput = Animated.createAnimatedComponent(TouchableOpacity);

interface IBottomBarProps {
  state: BottomTabBarProps;
  descriptors: BottomTabBarProps;
  navigation: BottomTabBarProps;
}

const BottomBar = ({ state, descriptors, navigation }: IBottomBarProps) => {
  const [open, setOpen] = useState(false);

  const rotation = useDerivedValue(() => {
    return withTiming(open ? '135deg' : '0deg');
  }, [open]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: rotation.value }],
  }));

  const _addOptionsRef = useRef();

  const onAddPress = () => {
    setOpen(prev => !prev);
  };

  return (
    <>
      <View
        style={{
          backgroundColor: 'white',
          elevation: 4,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}>
        <View style={styles.tabItemContainer}>
          {state?.routes?.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                // The `merge: true` option makes sure that the params inside the tab screen are preserved
                navigation.navigate({ name: route.name, merge: true });
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            if (label == 'Add') {
              return (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  key={index}
                  onLongPress={onLongPress}
                  style={[styles.tabItem]}
                  onPress={onPress}>
                  <AnimatedTextInput
                    style={[
                      {
                        backgroundColor: 'white',
                        borderRadius: 100,
                        padding: 12,
                        elevation: 4,
                        position: 'absolute',
                        top: -36,
                      },
                      rotationStyle,
                    ]}
                    onPress={() => onAddPress()}>
                    <SvgXml xml={add_icon} style={styles.addIcon} />
                  </AnimatedTextInput>
                  {state?.index === index ? (
                    <GradientText style={styles.tabItemText}>{label}</GradientText>
                  ) : (
                    <Text style={styles.tabItemText}>{label}</Text>
                  )}
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                key={index}
                onLongPress={onLongPress}
                style={styles.tabItem}
                onPress={onPress}>
                {index === 0 && <MapExplore color={state?.index === index} />}
                {index === 1 && <ListIcon color={state?.index === index} />}
                {index === 2 && <PlotIcon color={state?.index === index} />}
                {state?.index === index ? (
                  <GradientText style={styles.tabItemText}>{label}</GradientText>
                ) : (
                  <Text style={styles.tabItemText}>{label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <AddOptionsModal setVisible={setOpen} visible={open} ref={_addOptionsRef} />
    </>
  );
};

export default BottomBar;

const styles = StyleSheet.create({
  addIcon: {
    width: 48,
    height: 48,
  },
  tabItemContainer: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    marginVertical: 15,
  },
  tabItem: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  tabItemText: {
    marginTop: Spacing.SCALE_8,
    color: Colors.TEXT_LIGHT,
    fontSize: Typography.FONT_SIZE_14,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
  },
});
