import React, {memo, useEffect, useRef, useState} from 'react';
import {View, Animated, Easing} from 'react-native';
import {Avatar, useTheme, Text} from 'react-native-paper';
import Svg, {Circle, G} from 'react-native-svg';
import {useStyles} from '@/styles';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Ticks = memo(
  ({
    target,
    unitLen,
    tickArcLen,
    isFull,
    cx,
    cy,
    radius,
    strokeWidth,
    C,
    color,
  }) => {
    if (target <= 0 || unitLen <= 0 || tickArcLen <= 0) return null;

    const EPS = 1e-3;
    const count = isFull ? target : Math.max(0, target - 1);
    const arc = Math.max(0, Math.min(C - EPS, tickArcLen));
    const dashArray = `${arc} ${Math.max(0, C - arc)}`;

    const ticks = [];
    for (let i = 0; i < count; i++) {
      const m = (isFull ? 0 : 1) + i;
      const pos = m * unitLen;
      ticks.push(
        <Circle
          key={`tick-${i}`}
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={dashArray}
          strokeDashoffset={-(pos - arc / 2)}
          strokeLinecap="butt"
        />,
      );
    }
    return <>{ticks}</>;
  },
);

const AnimatedCounter = memo(({progress, color, style}) => {
  const countAnim = useRef(new Animated.Value(progress)).current;
  const [displayedCount, setDisplayedCount] = useState(progress);
  const prevRef = useRef(progress);

  useEffect(() => {
    const listener = countAnim.addListener(({value}) => {
      setDisplayedCount(Math.round(value));
    });
    return () => countAnim.removeListener(listener);
  }, [countAnim]);

  useEffect(() => {
    if (progress === prevRef.current) return;
    Animated.timing(countAnim, {
      toValue: progress,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    prevRef.current = progress;
  }, [progress, countAnim]);

  return (
    <Text variant="headlineSmall" style={[style, {color}]}>
      {displayedCount}
    </Text>
  );
});

const PieCircle = ({
  goalCount = 0,
  doneCount = 0,
  icon,
  opacity: propOpacity = 1,
  showCounter = false,
  isGoalReached = false,
  isPulsing = false,
}) => {
  const theme = useTheme();
  const styles = useStyles();

  const size = 140;
  const strokeWidth = 10;
  const animateDuration = 550;

  const progress = Math.max(0, doneCount || 0);
  const target = Math.max(0, goalCount || 0);

  let tickArcLen = 1.2;
  if (target >= 200) {
    tickArcLen = 0;
  } else if (target >= 150) {
    tickArcLen = 0.4;
  } else if (target >= 100) {
    tickArcLen = 0.7;
  } else if (target >= 50) {
    tickArcLen = 1;
  }

  const _iconColor = isGoalReached
    ? theme?.colors?.success
    : theme?.colors?.primary;
  const _progressColor = isGoalReached
    ? theme?.colors?.success
    : theme?.colors?.primary;
  const _trackColor = theme?.colors?.surfaceVariant;
  const _tickColor = theme?.colors?.surface;

  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * radius;

  const progressFraction = target > 0 ? Math.min(1, progress / target) : 0;
  const isFull = target > 0 && progress >= target;
  const unitLen = target > 0 ? C / target : 0;

  const progressAnim = useRef(new Animated.Value(progressFraction)).current;
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      progressAnim.setValue(progressFraction);
      return;
    }
    Animated.timing(progressAnim, {
      toValue: progressFraction,
      duration: animateDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressFraction, progressAnim]);

  const dashOffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C, 0],
  });

  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPulsing) {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isPulsing, pulseAnim]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const haloLayers = [
    {extra: 6, borderWidth: 2, peak: 0.35},
    {extra: 14, borderWidth: 1.5, peak: 0.18},
    {extra: 22, borderWidth: 1, peak: 0.08},
  ];

  const showsCounter = showCounter && target > 0;
  const swapAnim = useRef(new Animated.Value(showsCounter ? 1 : 0)).current;
  const swapMounted = useRef(false);

  useEffect(() => {
    if (!swapMounted.current) {
      swapMounted.current = true;
      swapAnim.setValue(showsCounter ? 1 : 0);
      return;
    }
    Animated.timing(swapAnim, {
      toValue: showsCounter ? 1 : 0,
      duration: 450,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [showsCounter, swapAnim]);

  const iconOpacity = swapAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const availableSpace = size - (strokeWidth + 8) * 2;
  const iconSize = Math.max(44, availableSpace);

  return (
    <View
      style={[
        styles.circle__container,
        {width: size, height: size, opacity: propOpacity},
      ]}>
      {isPulsing &&
        haloLayers.map(({extra, borderWidth, peak}, i) => {
          const haloSize = size + extra;
          const layerOpacity = pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, peak],
          });
          return (
            <Animated.View
              key={`halo-${i}`}
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: (size - haloSize) / 2,
                left: (size - haloSize) / 2,
                width: haloSize,
                height: haloSize,
                borderRadius: haloSize / 2,
                borderWidth,
                borderColor: theme?.colors?.primary,
                opacity: layerOpacity,
                transform: [{scale: pulseScale}],
              }}
            />
          );
        })}
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${cx}, ${cy}`}>
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={_trackColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="butt"
          />

          {progressFraction > 0 && (
            <AnimatedCircle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={_progressColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${C} ${C}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
            />
          )}

          <Ticks
            target={target}
            unitLen={unitLen}
            tickArcLen={tickArcLen}
            isFull={isFull}
            cx={cx}
            cy={cy}
            radius={radius}
            strokeWidth={strokeWidth}
            C={C}
            color={_tickColor}
          />
        </G>
      </Svg>

      <View
        pointerEvents="none"
        style={[
          styles.circle__centerContent,
          {alignItems: 'center', justifyContent: 'center'},
        ]}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: iconOpacity,
          }}>
          <Avatar.Icon
            icon={icon}
            size={iconSize}
            style={{backgroundColor: 'transparent'}}
            color={_iconColor}
          />
        </Animated.View>
        {target > 0 && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: swapAnim,
            }}>
            <AnimatedCounter
              progress={progress}
              color={_progressColor}
              style={[
                styles.circle__flashText,
                {
                  fontSize: Math.min(32, size * 0.24),
                  lineHeight: Math.min(32, size * 0.24) * 1.25,
                },
              ]}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
};

export default PieCircle;
