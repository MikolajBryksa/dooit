import React, {useEffect, useMemo, useRef} from 'react';
import {View, StyleSheet, Animated, Easing} from 'react-native';
import {Avatar, useTheme} from 'react-native-paper';
import Svg, {Circle, Defs, LinearGradient, Stop, G} from 'react-native-svg';

/**
 * StatusIconCircle
 *
 * Minimal, easy-to-maintain status ring that visually matches the existing diagram
 * (same circular shape, same default colors), but has a different job: show an icon
 * with a status ring around it.
 *
 * Props (boolean flags; if multiple are true, priority is: loading > end > empty):
 * - end:    show celebration/win icon; ring color = good choices color (theme.primary)
 * - loading:show hourglass/time icon; ring is a spinning segment with a subtle gradient
 * - empty:  show X icon; ring color = skip color (same as previous diagram's skip)
 *
 * Shared styling:
 * - Track uses theme.colors.surfaceVariant to match the diagram
 * - Ring shape and proportions match via size & strokeWidth
 */
const StatusIconCircle = ({
  end = false,
  loading = false,
  empty = false,
  size = 120,
  strokeWidth = 10,
  iconSize: iconSizeProp,
}) => {
  const theme = useTheme();

  // color mapping aligned with the original diagram
  const goodColor = theme?.colors?.primary; // good choices
  const skipColor = theme?.colors?.background; // skip
  const trackColor = theme?.colors?.surfaceVariant; // background track

  // geometry
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * radius;

  const iconSize = useMemo(() => {
    return iconSizeProp ?? Math.max(24, size - (strokeWidth + 8) * 2);
  }, [iconSizeProp, size, strokeWidth]);

  // STATUS RESOLUTION (priority: loading > end > empty)
  const isLoading = !!loading;
  const isEnd = !isLoading && !!end;
  const isEmpty = !isLoading && !isEnd && !!empty;

  // ---- LOADING ANIMATION (spinning ring) ----
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

  // Spinner segment length (portion of circumference)
  const spinnerArc = Math.max(24, C * 0.28);

  // We keep the gradient definition simple/maintainable. Using a linear gradient across the canvas
  // and rotating only the segment creates a visible shimmer that makes the motion clear without
  // complex SVG animation.

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      {/* --- BACKGROUND TRACK, always visible to keep the look consistent with the diagram --- */}
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

      {/* --- STATUS RING LAYER --- */}
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
              <LinearGradient
                id="spinGrad"
                x1="0"
                y1="0"
                x2={size}
                y2={size}
                gradientUnits="userSpaceOnUse">
                <Stop offset="0%" stopColor={goodColor} stopOpacity="0.15" />
                <Stop offset="50%" stopColor={goodColor} stopOpacity="0.85" />
                <Stop offset="100%" stopColor={goodColor} stopOpacity="0.3" />
              </LinearGradient>
            </Defs>
            {/* a single segment that rotates around */}
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

      {/* --- CENTER ICON --- */}
      <View pointerEvents="none" style={styles.centerContent}>
        <Avatar.Icon
          size={iconSize}
          style={{backgroundColor: 'transparent'}}
          color={goodColor}
          icon={isLoading ? 'timer' : isEnd ? 'star' : 'close-thick'}
        />
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
});

export default StatusIconCircle;
