import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';
import {useTheme} from 'react-native-paper';
import Svg, {Circle, G} from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PieChart = ({score = 0, max = 1, level = 1, label = '', size = 100}) => {
  const theme = useTheme();
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const [displayLevelValue, setDisplayLevelValue] = React.useState(level);

  const progressAnimation = useRef(new Animated.Value(0)).current;
  const levelAnimation = useRef(new Animated.Value(level)).current;
  const opacityAnimation = useRef(new Animated.Value(1)).current;

  const prevLevelRef = useRef(level);
  const prevScoreRef = useRef(score);

  const percentage = max > 0 ? Math.min(score / max, 1) : 0;

  useEffect(() => {
    prevScoreRef.current = score;

    Animated.timing(progressAnimation, {
      toValue: percentage,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    if (level !== prevLevelRef.current) {
      prevLevelRef.current = level;

      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setDisplayLevelValue(level);

        levelAnimation.setValue(level);

        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      });
    }
  }, [
    percentage,
    score,
    level,
    progressAnimation,
    levelAnimation,
    opacityAnimation,
    setDisplayLevelValue,
  ]);

  const strokeDashoffset = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.surfaceVariant}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress Circle */}
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.primary}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Center Content */}
      <View style={styles.centerContent}>
        <Text style={[styles.labelText, {color: theme.colors.onSurface}]}>
          {label}
        </Text>
        <Animated.Text
          style={[
            styles.levelText,
            {
              color: theme.colors.primary,
              fontSize: size / 3,
              opacity: opacityAnimation,
            },
          ]}>
          {displayLevelValue}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 12,
    marginBottom: 2,
    opacity: 0.8,
  },
  levelText: {
    fontWeight: 'bold',
  },
  scoreTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PieChart;
