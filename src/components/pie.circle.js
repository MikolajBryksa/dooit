import React, {useMemo, useEffect, useState, useRef} from 'react';
import {View, StyleSheet, Animated, Easing} from 'react-native';
import {Avatar, useTheme, Text} from 'react-native-paper';
import Svg, {Circle, G} from 'react-native-svg';

const PieCircle = ({
  effectiveness = null,
  goodCount = 0,
  totalExpected = 0,
  missedCount = 0,
  badCount = 0,
  icon,
  opacity: propOpacity = 1,
  showPercentage = false,
}) => {
  const theme = useTheme();

  const size = 140;
  const strokeWidth = 10;
  const animateDuration = 550;
  const opacity = propOpacity;

  let tickArcLen = 1.2;
  if (totalExpected >= 200) {
    tickArcLen = 0;
  } else if (totalExpected >= 150) {
    tickArcLen = 0.4;
  } else if (totalExpected >= 100) {
    tickArcLen = 0.7;
  } else if (totalExpected >= 50) {
    tickArcLen = 1;
  }

  const _iconColor = theme?.colors?.primary;
  const _goodColor = theme?.colors?.primary;
  const _badColor = theme?.colors?.error;
  const _missedColor = theme?.colors?.surfaceVariant;
  const _trackColor = theme?.colors?.surfaceVariant;
  const _tickColor = theme?.colors?.surface;

  const radius = (size - strokeWidth) / 2;
  const cx = size / 2,
    cy = size / 2;
  const C = 2 * Math.PI * radius;
  const EPS = 1e-3;

  const totalShown = Math.max(0, totalExpected);
  const fG = totalShown > 0 ? goodCount / totalShown : 0;
  const fB = totalShown > 0 ? badCount / totalShown : 0;
  const fM = totalShown > 0 ? missedCount / totalShown : 0;

  const target = useMemo(
    () => ({
      g: C * fG,
      b: C * fB,
      m: C * fM,
    }),
    [C, fG, fB, fM],
  );

  const mountedRef = useRef(false);
  const prevRef = useRef({g: 0, b: 0, m: 0});
  const t = useRef(new Animated.Value(1)).current;
  const [animT, setAnimT] = useState(1);

  useEffect(() => {
    const sub = t.addListener(({value}) => setAnimT(value));
    return () => t.removeListener(sub);
  }, [t]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevRef.current = target;
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
      if (finished) {
        prevRef.current = target;
      }
    });
  }, [target.g, target.b, target.m, animateDuration, t]);

  const lerp = (a, b, k) => a + (b - a) * k;

  const lenG = lerp(prevRef.current.g, target.g, animT);
  const lenB = lerp(prevRef.current.b, target.b, animT);
  const lenM = lerp(prevRef.current.m, target.m, animT);

  const startG = 0;
  const startB = lenG;
  const startM = lenG + lenB;

  const hasAny = lenG > EPS || lenB > EPS || lenM > EPS;

  const isFullG = lenG > C - EPS;
  const isFullB = lenB > C - EPS;
  const isFullM = lenM > C - EPS;

  const unitG = goodCount > 0 ? lenG / goodCount : 0;
  const unitB = badCount > 0 ? lenB / badCount : 0;
  const unitM = missedCount > 0 ? lenM / missedCount : 0;

  const prevEffectiveness = useRef(effectiveness ?? 0);
  const effectivenessAnim = useRef(
    new Animated.Value(effectiveness ?? 0),
  ).current;
  const [displayedEffectiveness, setDisplayedEffectiveness] = useState(
    effectiveness ?? 0,
  );

  useEffect(() => {
    const listener = effectivenessAnim.addListener(({value}) => {
      setDisplayedEffectiveness(Math.round(value));
    });
    return () => effectivenessAnim.removeListener(listener);
  }, [effectivenessAnim]);

  useEffect(() => {
    if (effectiveness === null) {
      prevEffectiveness.current = 0;
      effectivenessAnim.setValue(0);
      setDisplayedEffectiveness(0);
      return;
    }

    const dEff = effectiveness - prevEffectiveness.current;

    if (Math.abs(dEff) > 0.1) {
      Animated.timing(effectivenessAnim, {
        toValue: effectiveness,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
      prevEffectiveness.current = effectiveness;
    }
  }, [effectiveness, effectivenessAnim]);

  const availableSpace = size - (strokeWidth + 8) * 2;
  const iconSize = Math.max(44, availableSpace);

  const TinyArc = ({at, length, stroke}) => {
    if (!hasAny || length <= 0) return null;
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
    <View style={[styles.container, {width: size, height: size, opacity}]}>
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

          {hasAny && lenG > EPS && (
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={_goodColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${lenG} ${Math.max(0, C - lenG)}`}
              strokeDashoffset={-startG}
              strokeLinecap="butt"
            />
          )}

          {hasAny && lenB > EPS && (
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={_badColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${lenB} ${Math.max(0, C - lenB)}`}
              strokeDashoffset={-startB}
              strokeLinecap="butt"
            />
          )}

          {hasAny && lenM > EPS && (
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={_missedColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${lenM} ${Math.max(0, C - lenM)}`}
              strokeDashoffset={-startM}
              strokeLinecap="butt"
            />
          )}

          {lenG > EPS &&
            goodCount > 0 &&
            unitG > 0 &&
            Array.from({
              length: isFullG ? goodCount : Math.max(0, goodCount - 1),
            }).map((_, i) => {
              const m = (isFullG ? 0 : 1) + i;
              const pos = startG + m * unitG;
              return (
                <TinyArc
                  key={`tick-g-${i}`}
                  at={pos}
                  length={tickArcLen}
                  stroke={_tickColor}
                />
              );
            })}

          {lenB > EPS &&
            badCount > 0 &&
            unitB > 0 &&
            Array.from({
              length: isFullB ? badCount : Math.max(0, badCount - 1),
            }).map((_, i) => {
              const m = (isFullB ? 0 : 1) + i;
              const pos = startB + m * unitB;
              return (
                <TinyArc
                  key={`tick-b-${i}`}
                  at={pos}
                  length={tickArcLen}
                  stroke={_tickColor}
                />
              );
            })}

          {lenM > EPS &&
            missedCount > 0 &&
            unitM > 0 &&
            Array.from({
              length: isFullM ? missedCount : Math.max(0, missedCount - 1),
            }).map((_, i) => {
              const m = (isFullM ? 0 : 1) + i;
              const pos = startM + m * unitM;
              return (
                <TinyArc
                  key={`tick-m-${i}`}
                  at={pos}
                  length={tickArcLen}
                  stroke={_tickColor}
                />
              );
            })}

          {lenG > EPS && (lenB > EPS || lenM > EPS) && (
            <>
              {lenB > EPS && (
                <TinyArc
                  key="sep-g-b"
                  at={startB}
                  length={tickArcLen}
                  stroke={_tickColor}
                />
              )}
              {lenM > EPS && (
                <TinyArc
                  key="sep-end-m"
                  at={startM}
                  length={tickArcLen}
                  stroke={_tickColor}
                />
              )}
              <TinyArc
                key="sep-wrap"
                at={startG}
                length={tickArcLen}
                stroke={_tickColor}
              />
            </>
          )}
        </G>
      </Svg>

      <View pointerEvents="none" style={styles.centerContent}>
        {showPercentage && effectiveness !== null ? (
          <Text
            style={[
              styles.flashText,
              {
                color: _goodColor,
                fontSize: Math.min(32, size * 0.24),
              },
            ]}>
            {displayedEffectiveness}%
          </Text>
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
  flashText: {fontWeight: '800', letterSpacing: 0.5},
});

export default PieCircle;
