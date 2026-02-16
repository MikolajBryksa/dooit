import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
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
import InfoCircle from '../circles/info.circle';

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
  const [hasExistingSummary, setHasExistingSummary] = useState(false);
  const [hadError, setHadError] = useState(false);

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

  useEffect(() => {
    // Check if we have an existing summary for today
    try {
      const existingSummary = getDailySummary(todayKey);

      if (existingSummary?.aiSummary) {
        const text = existingSummary.aiSummary;
        setAiSummary(text);
        setHasExistingSummary(true);
        setHadError(false);
        return;
      }

      if (todayHabits.length === 0) {
        const msg = t('summary.no-actions');
        setAiSummary(msg);
        setHasExistingSummary(false);
        setHadError(false);
        return;
      }

      // We can generate a new summary, but don't auto-generate text
      setAiSummary('');
      setHasExistingSummary(false);
      setHadError(false);
    } catch (e) {
      const msg = t('summary.error-reading');
      setAiSummary(msg);
      setHasExistingSummary(false);
      setHadError(true);
    }
  }, [todayKey, todayHabits.length, t]);

  const handleGenerate = async () => {
    if (loadingAI || todayHabitsWithEff.length === 0 || !isConnected) return;

    setLoadingAI(true);
    setHadError(false);
    setAiSummary('');

    try {
      const response = await generateAiSummary(todayHabitsWithEff);
      setAiSummary(response);

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
      iconContent={<InfoCircle end />}
      subtitleContent={
        <Text variant="titleMedium">{t('summary.subtitle')}</Text>
      }
      titleContent={<Text variant="titleLarge">{t('summary.title')}</Text>}
      textContent={
        hasText ? (
          <View style={styles.summary_container}>
            <Text variant="bodyMedium" style={styles.summary__text}>
              {aiSummary}
            </Text>
          </View>
        ) : null
      }
      buttonsContent={renderButton()}
    />
  );
};

export default EndCard;
