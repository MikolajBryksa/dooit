import React, {useMemo, useEffect, useState, useRef} from 'react';
import {View, StyleSheet, Animated, Easing} from 'react-native';
import {Avatar, useTheme, Text} from 'react-native-paper';
import Svg, {Circle, G} from 'react-native-svg';

const PieChart = ({
  good = 0,
  bad = 0,
  skip = 0,
  icon,
  size = 120,
  strokeWidth = 10,

  animateDuration = 550,
  flashDuration = 700,
  showTicks = true,
  tickArcLen = 1.3,
  opacity = 1,
}) => {
  const theme = useTheme();

  if (good + bad + skip >= 200) {
    tickArcLen = 0;
  } else if (good + bad + skip >= 150) {
    tickArcLen = 0.4;
  } else if (good + bad + skip >= 100) {
    tickArcLen = 0.7;
  } else if (good + bad + skip >= 50) {
    tickArcLen = 1;
  }

  const _goodColor = theme?.colors?.primary;
  const _badColor = theme?.colors?.error;
  const _skipColor = theme?.colors?.background;
  const _trackColor = theme?.colors?.surfaceVariant;
  const _tickColor = theme?.colors?.surface;

  const radius = (size - strokeWidth) / 2;
  const cx = size / 2,
    cy = size / 2;
  const C = 2 * Math.PI * radius;
  const EPS = 1e-3;

  const total = Math.max(0, good + bad + skip);
  const fG = total > 0 ? good / total : 0;
  const fB = total > 0 ? bad / total : 0;
  const fS = total > 0 ? skip / total : 0;

  const target = useMemo(
    () => ({
      g: C * fG,
      b: C * fB,
      s: C * fS,
    }),
    [C, fG, fB, fS],
  );

  const mountedRef = useRef(false);
  const prevRef = useRef({g: 0, b: 0, s: 0});
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
  }, [target.g, target.b, target.s, animateDuration, t]);

  const lerp = (a, b, k) => a + (b - a) * k;

  const lenG = lerp(prevRef.current.g, target.g, animT);
  const lenB = lerp(prevRef.current.b, target.b, animT);
  const lenS = lerp(prevRef.current.s, target.s, animT);

  const startG = 0;
  const startB = lenG;
  const startS = lenG + lenB;

  const hasAny = lenG > EPS || lenB > EPS || lenS > EPS;

  const isFullG = lenG > C - EPS;
  const isFullB = lenB > C - EPS;
  const isFullS = lenS > C - EPS;

  const unitG = good > 0 ? lenG / good : 0;
  const unitB = bad > 0 ? lenB / bad : 0;
  const unitS = skip > 0 ? lenS / skip : 0;

  const prevVals = useRef({good, bad, skip});
  const [flash, setFlash] = useState({
    text: '',
    color: '#000',
    visible: false,
    showValue: null,
  });
  const flashScale = useRef(new Animated.Value(0.9)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dg = good - prevVals.current.good;
    const db = bad - prevVals.current.bad;
    const ds = skip - prevVals.current.skip;
    prevVals.current = {good, bad, skip};
    let show = null;
    let showValue = null;
    if (dg === 1) {
      show = {text: '+1', color: _goodColor};
      showValue = 'good';
    } else if (db === 1) {
      show = {text: '-1', color: _badColor};
      showValue = 'bad';
    } else if (ds === 1) {
      show = {text: '0', color: _skipColor};
      showValue = 'skip';
    }

    if (show) {
      setFlash({...show, visible: true, showValue: null});
      flashScale.setValue(0.9);
      flashOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(flashScale, {toValue: 1, useNativeDriver: true}),
        Animated.timing(flashOpacity, {
          toValue: 1,
          duration: 160,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
      const timer = setTimeout(() => {
        Animated.timing(flashOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start(() => setFlash(f => ({...f, visible: false, showValue})));
      }, flashDuration);
      return () => clearTimeout(timer);
    }
  }, [
    good,
    bad,
    skip,
    _goodColor,
    _badColor,
    theme?.colors,
    flashDuration,
    flashOpacity,
    flashScale,
  ]);

  const iconSize = Math.max(24, size - (strokeWidth + 8) * 2);

  return (
    <View style={[styles.container, {width: size, height: size, opacity}]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${cx}, ${cy}`}>
          {/* track */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={_trackColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="butt"
          />

          {/* segments */}
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
          {hasAny && lenS > EPS && (
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={_skipColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${lenS} ${Math.max(0, C - lenS)}`}
              strokeDashoffset={-startS}
              strokeLinecap="butt"
            />
          )}

          {/* good */}
          {showTicks &&
            lenG > EPS &&
            good > 0 &&
            unitG > 0 &&
            Array.from({length: isFullG ? good : Math.max(0, good - 1)}).map(
              (_, i) => {
                const m = (isFullG ? 0 : 1) + i;
                const pos = startG + m * unitG;
                const offset = -(pos - tickArcLen / 2);
                return (
                  <Circle
                    key={`g-tick-${i}`}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke={_tickColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${tickArcLen} ${Math.max(
                      0,
                      C - tickArcLen,
                    )}`}
                    strokeDashoffset={offset}
                    strokeLinecap="butt"
                  />
                );
              },
            )}

          {/* bad */}
          {showTicks &&
            lenB > EPS &&
            bad > 0 &&
            unitB > 0 &&
            Array.from({length: isFullB ? bad : Math.max(0, bad - 1)}).map(
              (_, i) => {
                const m = (isFullB ? 0 : 1) + i;
                const pos = startB + m * unitB;
                const offset = -(pos - tickArcLen / 2);
                return (
                  <Circle
                    key={`b-tick-${i}`}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke={_tickColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${tickArcLen} ${Math.max(
                      0,
                      C - tickArcLen,
                    )}`}
                    strokeDashoffset={offset}
                    strokeLinecap="butt"
                  />
                );
              },
            )}

          {/* skip */}
          {showTicks &&
            lenS > EPS &&
            skip > 0 &&
            unitS > 0 &&
            Array.from({length: isFullS ? skip : Math.max(0, skip - 1)}).map(
              (_, i) => {
                const m = (isFullS ? 0 : 1) + i;
                const pos = startS + m * unitS;
                const offset = -(pos - tickArcLen / 2);
                return (
                  <Circle
                    key={`s-tick-${i}`}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke={_tickColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${tickArcLen} ${Math.max(
                      0,
                      C - tickArcLen,
                    )}`}
                    strokeDashoffset={offset}
                    strokeLinecap="butt"
                  />
                );
              },
            )}
        </G>
      </Svg>

      <View pointerEvents="none" style={styles.centerContent}>
        {flash.visible ? (
          <Animated.Text
            style={[
              styles.flashText,
              {
                color: flash.color,
                transform: [{scale: flashScale}],
                opacity: flashOpacity,
                fontSize: Math.min(40, size * 0.28),
              },
            ]}>
            {flash.text}
          </Animated.Text>
        ) : flash.showValue === 'good' ? (
          <Text
            style={[
              styles.flashText,
              {color: _goodColor, fontSize: Math.min(40, size * 0.28)},
            ]}>
            {good}
          </Text>
        ) : flash.showValue === 'bad' ? (
          <Text
            style={[
              styles.flashText,
              {color: _badColor, fontSize: Math.min(40, size * 0.28)},
            ]}>
            {bad}
          </Text>
        ) : flash.showValue === 'skip' ? (
          <Text
            style={[
              styles.flashText,
              {color: _skipColor, fontSize: Math.min(40, size * 0.28)},
            ]}>
            {skip}
          </Text>
        ) : (
          <Avatar.Icon
            icon={icon}
            size={iconSize}
            style={{backgroundColor: 'transparent'}}
            color={_goodColor}
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

export default PieChart;
