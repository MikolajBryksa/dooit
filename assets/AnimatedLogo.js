import React, {useEffect} from 'react';
import {Image} from 'react-native';
import appIconDarkTheme from '../assets/appIconDarkTheme.png';
import appIconLightTheme from '../assets/appIconLightTheme.png';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {useTheme} from 'react-native-paper';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const AnimatedLogo = () => {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const logoSource = theme.dark ? appIconDarkTheme : appIconLightTheme;

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.2, {duration: 400}),
      withTiming(1, {duration: 400}),
    );

    opacity.value = withSequence(withTiming(1, {duration: 600}));
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  return (
    <AnimatedImage
      source={logoSource}
      style={[
        {
          width: 200,
          height: 200,
          tintColor: theme.colors.primary,
        },
        animatedStyle,
      ]}
      resizeMode="contain"
    />
  );
};

export default AnimatedLogo;
