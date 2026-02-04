import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, Animated, Easing} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {useStyles} from '@/styles';
import {updateSettingValue} from '@/services/settings.service';
import {deleteUnavailableHabits} from '@/services/habits.service';
import {setSettings} from '@/redux/actions';
import MainCard from './main.card';
import StatusIconCircle from './status-icon.circle';
import {EXPAND_DELAY, EXPAND_DURATION, HEIGHT_FUDGE} from '@/constants';

const StartCard = ({onStart}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);

  const fullText = useMemo(
    () => t('onboarding.start.text', {userName: settings.userName}),
    [t, settings.userName],
  );

  const [measuredHeight, setMeasuredHeight] = useState(0);
  const [expandComplete, setExpandComplete] = useState(false);

  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    setExpandComplete(false);
    setMeasuredHeight(0);
    heightAnim.setValue(0);
    opacityAnim.setValue(0);
    translateAnim.setValue(10);
  }, [fullText, heightAnim, opacityAnim, translateAnim]);

  useEffect(() => {
    if (!measuredHeight) return;

    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: measuredHeight + HEIGHT_FUDGE,
        duration: EXPAND_DURATION,
        delay: EXPAND_DELAY,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 450,
        delay: EXPAND_DELAY,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 650,
        delay: EXPAND_DELAY,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished) setExpandComplete(true);
    });
  }, [measuredHeight, heightAnim, opacityAnim, translateAnim]);

  const handleStart = useCallback(() => {
    deleteUnavailableHabits();
    updateSettingValue('firstLaunch', false);
    dispatch(setSettings({...settings, firstLaunch: false}));
    onStart?.();
  }, [dispatch, onStart, settings]);

  return (
    <MainCard
      style={styles.summary__card}
      outline
      iconContent={<StatusIconCircle start />}
      titleContent={
        <Text variant="titleLarge">{t('onboarding.start.title')}</Text>
      }
      textContent={
        <View style={styles.summary_container}>
          {measuredHeight === 0 && (
            <View
              pointerEvents="none"
              collapsable={false}
              style={{position: 'absolute', left: 0, right: 0, opacity: 0}}>
              <View
                collapsable={false}
                onLayout={e => setMeasuredHeight(e.nativeEvent.layout.height)}>
                <Text
                  variant="bodyMedium"
                  style={[styles.summary__text, {includeFontPadding: false}]}>
                  {fullText}
                </Text>
              </View>
            </View>
          )}

          <Animated.View
            style={{
              height: heightAnim,
              overflow: 'hidden',
            }}>
            <Animated.View
              style={{
                opacity: opacityAnim,
                transform: [{translateY: translateAnim}],
              }}>
              <Text variant="bodyMedium" style={styles.summary__text}>
                {fullText}
              </Text>
            </Animated.View>
          </Animated.View>
        </View>
      }
      buttonsContent={
        <Button
          style={styles.button}
          mode="contained"
          icon={!expandComplete ? 'lock' : 'rocket-launch'}
          onPress={handleStart}
          disabled={!expandComplete}>
          {t('button.start')}
        </Button>
      }
    />
  );
};

export default StartCard;
