import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View, Animated, Easing} from 'react-native';
import {ActivityIndicator, Button, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {useStyles} from '@/styles';
import {useNetworkStatus, useTodayKey} from '@/hooks';
import {
  generateAiSummary,
  getDailySummary,
  saveSummary,
} from '@/services/summary.service';
import {logError} from '@/services/error-tracking.service';
import {calculateEffectiveness} from '@/services/effectiveness.service';
import MainCard from './main.card';
import StatusIconCircle from './status-icon.circle';
import {EXPAND_DELAY, EXPAND_DURATION, HEIGHT_FUDGE} from '@/constants';

const withEffectiveness = habits =>
  habits.map(h => {
    const stats = calculateEffectiveness(h.id, {
      id: h.id,
      repeatDays: h.repeatDays,
      repeatHours: h.repeatHours,
    });

    return {
      id: h.id,
      habitName: h.habitName,
      repeatDays: h.repeatDays,
      repeatHours: h.repeatHours,
      effectiveness: stats.effectiveness,
      totalCount: stats.totalCount,
    };
  });

const EndCard = ({weekdayKey}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const habits = useSelector(state => state.habits);
  const todayKey = useTodayKey();
  const {isConnected} = useNetworkStatus(true);

  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Expand state
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const [expandComplete, setExpandComplete] = useState(false);

  // UI flags
  const [hasExistingSummary, setHasExistingSummary] = useState(false);
  const [hadError, setHadError] = useState(false);

  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(10)).current;

  const availableHabits = useMemo(
    () => habits.filter(h => h.available),
    [habits],
  );

  const todayHabits = useMemo(
    () => habits.filter(h => h.available && h.repeatDays.includes(weekdayKey)),
    [habits, weekdayKey],
  );

  const allAvailableHabitsWithEff = useMemo(
    () => withEffectiveness(availableHabits),
    [availableHabits],
  );

  const todayHabitsWithEff = useMemo(
    () => withEffectiveness(todayHabits),
    [todayHabits],
  );

  const resetExpand = useMemo(
    () => () => {
      setExpandComplete(false);
      setMeasuredHeight(0);
      heightAnim.setValue(0);
      opacityAnim.setValue(0);
      translateAnim.setValue(10);
    },
    [heightAnim, opacityAnim, translateAnim],
  );

  useEffect(() => {
    // Check if we have an existing summary for today
    try {
      const existingSummary = getDailySummary(todayKey);

      if (existingSummary?.aiSummary) {
        const text = existingSummary.aiSummary;
        setAiSummary(text);
        setHasExistingSummary(true);
        setHadError(false);
        resetExpand();
        return;
      }

      if (todayHabits.length === 0) {
        const msg = t('summary.no-actions');
        setAiSummary(msg);
        setHasExistingSummary(false);
        setHadError(false);
        resetExpand();
        return;
      }

      // We can generate a new summary, but don't auto-generate text
      setAiSummary('');
      setHasExistingSummary(false);
      setHadError(false);
      resetExpand();
    } catch (e) {
      const msg = t('summary.error-reading');
      setAiSummary(msg);
      setHasExistingSummary(false);
      setHadError(true);
      resetExpand();
    }
  }, [todayKey, todayHabits.length, t, resetExpand]);

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

  const handleGenerate = async () => {
    if (loadingAI || todayHabitsWithEff.length === 0 || !isConnected) return;

    setLoadingAI(true);
    setHadError(false);

    setAiSummary('');
    resetExpand();

    try {
      const response = await generateAiSummary(todayHabitsWithEff);

      setAiSummary(response);
      resetExpand();

      try {
        await saveSummary(todayKey, allAvailableHabitsWithEff, response);
        setHasExistingSummary(true);
        setHadError(false);
      } catch (saveError) {
        await logError(saveError, 'EndCard.saveSummary');
        setHasExistingSummary(false);
        setHadError(true);
      }
    } catch (error) {
      await logError(error, 'EndCard.generateAiSummary');

      const msg = t('summary.no-response');
      setAiSummary(msg);
      resetExpand();

      setHasExistingSummary(false);
      setHadError(true);

      try {
        await saveSummary(todayKey, allAvailableHabitsWithEff, null);
      } catch (saveError) {
        await logError(saveError, 'EndCard.saveSummary.null');
      }
    } finally {
      setLoadingAI(false);
    }
  };

  const renderButton = () => {
    const hasHabitsToday = todayHabitsWithEff.length > 0;

    if (!hasHabitsToday || hasExistingSummary) return null;

    if (!isConnected) {
      return (
        <Button
          style={styles.button}
          mode="contained"
          onPress={() => {}}
          disabled
          icon="wifi-off">
          {t('button.offline')}
        </Button>
      );
    }

    if (loadingAI) {
      return (
        <Button
          style={styles.button}
          mode="contained"
          onPress={() => {}}
          disabled
          icon={() => <ActivityIndicator size={16} />}>
          {t('button.generating')}
        </Button>
      );
    }

    return (
      <Button
        style={styles.button}
        mode="contained"
        icon="creation"
        onPress={handleGenerate}>
        {hadError ? t('button.try-again') : t('button.generate-summary')}
      </Button>
    );
  };

  const hasText = !!aiSummary;

  return (
    <MainCard
      style={styles.summary__card}
      outline={true}
      iconContent={<StatusIconCircle end />}
      titleContent={<Text variant="titleLarge">{t('card.done')}</Text>}
      textContent={
        <View style={styles.summary_container}>
          {hasText && measuredHeight === 0 && (
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
                  {aiSummary}
                </Text>
              </View>
            </View>
          )}

          <Animated.View
            style={{
              height: hasText ? heightAnim : 0,
              overflow: 'hidden',
            }}>
            <Animated.View
              style={{
                opacity: opacityAnim,
                transform: [{translateY: translateAnim}],
              }}>
              <Text variant="bodyMedium" style={styles.summary__text}>
                {aiSummary}
              </Text>
            </Animated.View>
          </Animated.View>
        </View>
      }
      buttonsContent={renderButton()}
    />
  );
};

export default EndCard;
