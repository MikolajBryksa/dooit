import React, {useMemo, useEffect, useState, useRef} from 'react';
import {View, Animated, Easing} from 'react-native';
import {Avatar, useTheme, Text} from 'react-native-paper';
import Svg, {Circle, G} from 'react-native-svg';
import {useStyles} from '@/styles';

const PieCircle = ({
  goalCount = 0,
  goodCount = 0,
  icon,
  opacity: propOpacity = 1,
  showCounter = false,
  isGoalReached = false,
}) => {
  const theme = useTheme();
  const styles = useStyles();

  const size = 140;
  const strokeWidth = 10;
  const animateDuration = 550;
  const opacity = propOpacity;

  const progress = Math.max(0, goodCount || 0);
  const target = Math.max(0, goalCount || 0);
  const remaining = Math.max(0, target - progress);

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

  const _iconColor = isGoalReached ? theme?.colors?.success : theme?.colors?.primary;
  const _progressColor = isGoalReached ? theme?.colors?.success : theme?.colors?.primary;
  const _trackColor = theme?.colors?.surfaceVariant;
  const _tickColor = theme?.colors?.surface;

  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * radius;
  const EPS = 1e-3;

  const progressFraction = target > 0 ? Math.min(1, progress / target) : 0;

  const targetArc = useMemo(
    () => ({
      progressLen: C * progressFraction,
    }),
    [C, progressFraction],
  );

  const mountedRef = useRef(false);
  const prevRef = useRef({progressLen: 0});
  const t = useRef(new Animated.Value(1)).current;
  const [animT, setAnimT] = useState(1);

  useEffect(() => {
    const sub = t.addListener(({value}) => setAnimT(value));
    return () => t.removeListener(sub);
  }, [t]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevRef.current = targetArc;
      t.setValue(1);
      setAnimT(1);
      return;
    }

    t.setValue(0);
    Animated.timing(t, {
      toValue: 1,
      duration: animateDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({finished}) => {
      if (finished) prevRef.current = targetArc;
    });
  }, [targetArc.progressLen, animateDuration, t]);

  const lerp = (a, b, k) => a + (b - a) * k;
  const progressLen = lerp(
    prevRef.current.progressLen,
    targetArc.progressLen,
    animT,
  );

  const hasProgress = progressLen > EPS;
  const isFull = progressLen > C - EPS;
  const unitLen = target > 0 ? C / target : 0;

  const prevDisplayCount = useRef(progress);
  const countAnim = useRef(new Animated.Value(progress)).current;
  const [displayedCount, setDisplayedCount] = useState(progress);

  useEffect(() => {
    const listener = countAnim.addListener(({value}) => {
      setDisplayedCount(Math.round(value));
    });
    return () => countAnim.removeListener(listener);
  }, [countAnim]);

  useEffect(() => {
    if (progress === prevDisplayCount.current) return;

    Animated.timing(countAnim, {
      toValue: progress,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    prevDisplayCount.current = progress;
  }, [progress, countAnim]);

  const availableSpace = size - (strokeWidth + 8) * 2;
  const iconSize = Math.max(44, availableSpace);

  const TinyArc = ({at, length, stroke}) => {
    if (length <= 0) return null;

    const arc = Math.max(0, Math.min(C - EPS, length));
    const offset = -(at - arc / 2);

    return (
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${arc} ${Math.max(0, C - arc)}`}
        strokeDashoffset={offset}
        strokeLinecap="butt"
      />
    );
  };

  return (
    <View
      style={[styles.circle__container, {width: size, height: size, opacity}]}>
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

          {hasProgress && (
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={_progressColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${progressLen} ${Math.max(0, C - progressLen)}`}
              strokeDashoffset={0}
              strokeLinecap="butt"
            />
          )}

          {target > 0 &&
            unitLen > 0 &&
            Array.from({
              length: isFull ? target : Math.max(0, target - 1),
            }).map((_, i) => {
              const m = (isFull ? 0 : 1) + i;
              const pos = m * unitLen;

              return (
                <TinyArc
                  key={`tick-${i}`}
                  at={pos}
                  length={tickArcLen}
                  stroke={_tickColor}
                />
              );
            })}
        </G>
      </Svg>

      <View
        pointerEvents="none"
        style={[
          styles.circle__centerContent,
          {alignItems: 'center', justifyContent: 'center'},
        ]}>
        {showCounter && target > 0 ? (
          <>
            <Text
              style={[
                styles.circle__flashText,
                {
                  color: _progressColor,
                  fontSize: Math.min(32, size * 0.24),
                },
              ]}>
              {displayedCount}
            </Text>
          </>
        ) : (
          <Avatar.Icon
            icon={icon}
            size={iconSize}
            style={{backgroundColor: 'transparent'}}
            color={_iconColor}
          />
        )}
      </View>
    </View>
  );
};

export default PieCircle;
