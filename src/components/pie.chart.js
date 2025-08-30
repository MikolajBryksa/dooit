import React from 'react';
import {View, StyleSheet, Animated, Easing} from 'react-native';
import {Avatar, useTheme} from 'react-native-paper';
import Svg, {Circle, G} from 'react-native-svg';

const PieChart = ({
  good = 0,
  bad = 0,
  skip = 0,
  icon, // np. "star"
  size = 120,
  strokeWidth = 10,

  goodColor = '#3B82F6', // niebieski (good) + kolor ikony
  badColor = '#EF4444', // czerwony (bad)
  skipColor = '#FFFFFF', // biały (skip)
  trackColor = 'rgba(255,255,255,0.28)', // delikatna biel przy 0/0/0

  // Animacja
  animateDuration = 550, // ms
  flashDuration = 700,
}) => {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2,
    cy = size / 2;
  const C = 2 * Math.PI * radius;
  const EPS = 1e-3; // na szumy float

  // --- Frakcje docelowe ---
  const total = Math.max(0, good + bad + skip);
  const fG = total > 0 ? good / total : 0;
  const fB = total > 0 ? bad / total : 0;
  const fS = total > 0 ? skip / total : 0;

  // Docelowe długości
  const target = React.useMemo(() => {
    return {
      g: C * fG,
      b: C * fB,
      s: C * fS,
    };
  }, [C, fG, fB, fS]);

  // --- Animacja między poprzednim a nowym stanem ---
  const mountedRef = React.useRef(false);
  const prevRef = React.useRef({g: 0, b: 0, s: 0});
  const t = React.useRef(new Animated.Value(1)).current;
  const [animT, setAnimT] = React.useState(1);
  const [isAnimating, setIsAnimating] = React.useState(false);

  // nasłuch animacji -> force re-render
  React.useEffect(() => {
    const sub = t.addListener(({value}) => setAnimT(value));
    return () => t.removeListener(sub);
  }, [t]);

  // uruchamiaj animację przy zmianach wartości / rozmiaru
  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevRef.current = target;
      t.setValue(1);
      setAnimT(1);
      setIsAnimating(false);
      return;
    }
    setIsAnimating(true);
    t.setValue(0);
    Animated.timing(t, {
      toValue: 1,
      duration: animateDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animujemy liczby
    }).start(({finished}) => {
      if (finished) {
        prevRef.current = target;
        setIsAnimating(false);
      }
    });
  }, [target.g, target.b, target.s, animateDuration, t]);

  const lerp = (a, b, k) => a + (b - a) * k;

  // aktualne (animowane) długości
  const lenG = lerp(prevRef.current.g, target.g, animT);
  const lenB = lerp(prevRef.current.b, target.b, animT);
  const lenS = lerp(prevRef.current.s, target.s, animT);

  // animowane starty segmentów (kolejność: good → bad → skip), start = góra
  const startG = 0;
  const startB = lenG;
  const startS = lenG + lenB;

  const hasAny = lenG > EPS || lenB > EPS || lenS > EPS;

  // po zakończeniu animacji, jeśli 100% jednego segmentu — pełne koło w jego kolorze
  const targetSingle =
    total > 0 &&
    (good > 0 && bad === 0 && skip === 0
      ? 'good'
      : bad > 0 && good === 0 && skip === 0
      ? 'bad'
      : skip > 0 && good === 0 && bad === 0
      ? 'skip'
      : null);
  const showSolidSingle = targetSingle && !isAnimating;

  // --- Flash (+1/-1/0) ---
  const prevVals = React.useRef({good, bad, skip});
  const [flash, setFlash] = React.useState({
    text: '',
    color: '#000',
    visible: false,
  });
  const flashScale = React.useRef(new Animated.Value(0.9)).current;
  const flashOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const dg = good - prevVals.current.good;
    const db = bad - prevVals.current.bad;
    const ds = skip - prevVals.current.skip;
    prevVals.current = {good, bad, skip};
    let show = null;
    if (dg === 1) show = {text: '+1', color: goodColor};
    else if (db === 1) show = {text: '-1', color: badColor};
    else if (ds === 1)
      show = {text: '0', color: theme.colors?.onSurface ?? '#111827'};
    if (show) {
      setFlash({...show, visible: true});
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
        }).start(() => setFlash(f => ({...f, visible: false})));
      }, flashDuration);
      return () => clearTimeout(timer);
    }
  }, [
    good,
    bad,
    skip,
    goodColor,
    badColor,
    theme.colors,
    flashDuration,
    flashOpacity,
    flashScale,
  ]);

  const iconSize = Math.max(24, size - (strokeWidth + 8) * 2);

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Svg width={size} height={size}>
        {/* Start w górze (12:00) i CW */}
        <G rotation="-90" origin={`${cx}, ${cy}`}>
          {/* delikatny track */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="butt"
          />

          {/* pełne koło dla 100% jednego segmentu tylko gdy animacja zakończona */}
          {showSolidSingle === 'good' && (
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={goodColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
          )}
          {showSolidSingle === 'bad' && (
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={badColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
          )}
          {showSolidSingle === 'skip' && (
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={skipColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
          )}

          {/* W trakcie animacji lub gdy to nie 100% jednego segmentu — 3 dashi */}
          {!showSolidSingle && hasAny && lenG > EPS && (
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={goodColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${lenG} ${Math.max(0, C - lenG)}`}
              strokeDashoffset={-startG}
              strokeLinecap="butt"
            />
          )}
          {!showSolidSingle && hasAny && lenB > EPS && (
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={badColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${lenB} ${Math.max(0, C - lenB)}`}
              strokeDashoffset={-startB}
              strokeLinecap="butt"
            />
          )}
          {!showSolidSingle && hasAny && lenS > EPS && (
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={skipColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${lenS} ${Math.max(0, C - lenS)}`}
              strokeDashoffset={-startS}
              strokeLinecap="butt"
            />
          )}
        </G>
      </Svg>

      {/* Środek: flash albo niebieska ikona */}
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
        ) : (
          <Avatar.Icon
            icon={icon}
            size={iconSize}
            style={{backgroundColor: 'transparent'}}
            color={goodColor}
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
