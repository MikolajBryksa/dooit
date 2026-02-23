import React, {useEffect, useMemo, useRef} from 'react';
import {View, StyleSheet, Animated, Easing} from 'react-native';
import {Avatar, useTheme} from 'react-native-paper';
import Svg, {Circle, Defs, LinearGradient, Stop, G} from 'react-native-svg';
import {useStyles} from '@/styles';

const InfoCircle = ({end = false, loading = false, empty = false}) => {
  const theme = useTheme();
  const styles = useStyles();

  const size = 140;
  const strokeWidth = 10;

  const goodColor = theme?.colors?.primary;
  const trackColor = theme?.colors?.surfaceVariant;

  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * radius;

  const availableSpace = size - (strokeWidth + 8) * 2;
  const iconSize = Math.max(44, availableSpace);

  const isLoading = !!loading;
  const isEnd = !isLoading && !!end;
  const isEmpty = !isLoading && !isEnd && !!empty;
  const isStart = !isLoading && !isEnd && !isEmpty;

  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isLoading) {
      spin.setValue(0);
      Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      spin.stopAnimation();
      spin.setValue(0);
    }
  }, [isLoading, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinnerArc = Math.max(24, C * 0.7);

  return (
    <View style={[styles.circle__container, {width: size, height: size}]}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="butt"
        />
      </Svg>

      {!isLoading && (
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={goodColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="butt"
          />
        </Svg>
      )}

      {isLoading && (
        <Animated.View
          style={[StyleSheet.absoluteFill, {transform: [{rotate}]}]}>
          <Svg width={size} height={size}>
            <Defs>
              <LinearGradient id="spinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={goodColor} stopOpacity="1" />
                <Stop offset="100%" stopColor={goodColor} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <G rotation="-90" origin={`${cx}, ${cy}`}>
              <Circle
                cx={cx}
                cy={cy}
                r={radius}
                stroke="url(#spinGrad)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${spinnerArc} ${Math.max(0, C - spinnerArc)}`}
                strokeDashoffset={0}
                strokeLinecap="round"
              />
            </G>
          </Svg>
        </Animated.View>
      )}

      <View pointerEvents="none" style={styles.circle__centerContent}>
        <Avatar.Icon
          size={iconSize}
          style={{backgroundColor: 'transparent'}}
          color={goodColor}
          icon={
            isLoading
              ? 'timer'
              : isEnd
              ? 'star'
              : isEmpty
              ? 'close-thick'
              : isStart
              ? 'information-variant'
              : 'infinity'
          }
        />
      </View>
    </View>
  );
};

export default InfoCircle;
