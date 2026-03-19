import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {View} from 'react-native';
import {ActivityIndicator, Button, Text, IconButton} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {useStyles} from '@/styles';
import {useNetworkStatus, useTodayKey} from '@/hooks';
import {
  generateAiSummary,
  getDailySummary,
  saveSummary,
} from '@/services/summary.service';
import {logError} from '@/services/errors.service';
import {getTodayGoalStats} from '@/services/habits.service';
import NowComponent from '../components/now.component';
import InfoCircle from '../circles/info.circle';

const withTodayStats = (habits, todayKey, weekdayKey) =>
  habits.map(h => {
    const stats = getTodayGoalStats(h, todayKey, weekdayKey);

    return {
      id: h.id,
      habitName: h.habitName,
      repeatDays: h.repeatDays,
      repeatHours: h.repeatHours,
      icon: h.icon,
      goal: h.goal,
      todayTarget: stats.todayTarget,
      todayGoodCount: stats.todayGoodCount,
      todayBadCount: stats.todayBadCount,
      todayDoneCount: stats.todayDoneCount,
      todayRemainingCount: stats.todayRemainingCount,
      todayPercentage: stats.todayPercentage,
    };
  });

const sortForUi = (a, b) => {
  const percA = a.todayPercentage ?? -1;
  const percB = b.todayPercentage ?? -1;
  if (percB !== percA) return percB - percA;

  const goodA = a.todayGoodCount ?? 0;
  const goodB = b.todayGoodCount ?? 0;
  if (goodB !== goodA) return goodB - goodA;

  const remainingA = a.todayRemainingCount ?? 0;
  const remainingB = b.todayRemainingCount ?? 0;
  if (remainingA !== remainingB) return remainingA - remainingB;

  return String(a.habitName).localeCompare(String(b.habitName));
};

const sortForWorst = (a, b) => {
  const percA = a.todayPercentage ?? 101;
  const percB = b.todayPercentage ?? 101;
  if (percA !== percB) return percA - percB;

  const goodA = a.todayGoodCount ?? 999;
  const goodB = b.todayGoodCount ?? 999;
  if (goodA !== goodB) return goodA - goodB;

  const remainingA = a.todayRemainingCount ?? -1;
  const remainingB = b.todayRemainingCount ?? -1;
  if (remainingB !== remainingA) return remainingB - remainingA;

  return String(a.habitName).localeCompare(String(b.habitName));
};

const pickAiInputs = habitsWithStats => {
  const withTargets = habitsWithStats.filter(h => (h.todayTarget ?? 0) > 0);

  if (withTargets.length === 0) {
    return {mode: 'no-data', bestHabit: null, worstHabit: null};
  }

  const bestHabit = [...withTargets].sort(sortForUi)[0] || null;
  const worstHabit = [...withTargets].sort(sortForWorst)[0] || null;

  if (withTargets.length === 1) {
    return {mode: 'stable', bestHabit, worstHabit: null};
  }

  return {mode: 'complex', bestHabit, worstHabit};
};

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

  const todayHabits = useMemo(
    () => habits.filter(h => h.repeatDays.includes(weekdayKey)),
    [habits, weekdayKey],
  );

  const allHabitsWithStats = useMemo(
    () => withTodayStats(habits, todayKey, weekdayKey),
    [habits, todayKey, weekdayKey],
  );

  const todayHabitsWithStats = useMemo(
    () => withTodayStats(todayHabits, todayKey, weekdayKey),
    [todayHabits, todayKey, weekdayKey],
  );

  const sortedHabitsUi = useMemo(() => {
    return [...todayHabitsWithStats].sort(sortForUi);
  }, [todayHabitsWithStats]);

  useEffect(() => {
    try {
      const existingSummary = getDailySummary(todayKey);

      if (existingSummary?.aiSummary) {
        setAiSummary(existingSummary.aiSummary);
        setHasExistingSummary(true);
        setHadError(false);
        return;
      }

      if (todayHabits.length === 0) {
        setAiSummary(t('summary.no-actions'));
        setHasExistingSummary(false);
        setHadError(false);
        return;
      }

      setAiSummary('');
      setHasExistingSummary(false);
      setHadError(false);
    } catch (e) {
      setAiSummary(t('summary.error-reading'));
      setHasExistingSummary(false);
      setHadError(true);
    }
  }, [todayKey, todayHabits.length, t]);

  const handleGenerate = useCallback(async () => {
    if (loadingAI || todayHabitsWithStats.length === 0 || !isConnected) return;

    setLoadingAI(true);
    setHadError(false);
    setAiSummary('');

    try {
      const {mode, bestHabit, worstHabit} = pickAiInputs(todayHabitsWithStats);
      const response = await generateAiSummary(mode, bestHabit, worstHabit);

      setAiSummary(response);
      setHasExistingSummary(true);
      setLoadingAI(false);

      try {
        await saveSummary(todayKey, allHabitsWithStats, response);
      } catch (saveError) {
        await logError(saveError, 'EndCard.saveSummary');
      }
    } catch (error) {
      await logError(error, 'EndCard.generateAiSummary');

      setAiSummary(t('summary.no-response'));
      setHasExistingSummary(false);
      setHadError(true);
      setLoadingAI(false);

      try {
        await saveSummary(todayKey, allHabitsWithStats, null);
      } catch (saveError) {
        await logError(saveError, 'EndCard.saveSummary.null');
      }
    }
  }, [
    loadingAI,
    todayHabitsWithStats,
    isConnected,
    todayKey,
    allHabitsWithStats,
    t,
  ]);

  const renderButton = () => {
    const hasHabitsToday = todayHabitsWithStats.length > 0;

    if (!hasHabitsToday || hasExistingSummary) return null;

    if (!isConnected) {
      return (
        <Button mode="contained" onPress={() => {}} disabled icon="wifi-off">
          {t('button.offline')}
        </Button>
      );
    }

    if (loadingAI) {
      return (
        <Button
          mode="contained"
          onPress={() => {}}
          disabled
          icon={() => <ActivityIndicator size={16} />}>
          {t('button.generating')}
        </Button>
      );
    }

    return (
      <Button mode="contained" icon="creation" onPress={handleGenerate}>
        {hadError ? t('button.try-again') : t('button.generate-summary')}
      </Button>
    );
  };

  const renderHabitsList = () => {
    if (sortedHabitsUi.length === 0) return null;

    return (
      <View style={styles.summary__habits}>
        {sortedHabitsUi.map(habit => (
          <View key={habit.id} style={styles.summary__habit}>
            <IconButton
              icon={habit.icon || 'infinity'}
              size={20}
              style={styles.summary__habit__icon}
            />

            <Text variant="bodyMedium" style={styles.summary__habit__name}>
              {habit.habitName}
            </Text>

            <View style={styles.summary__habit__stats}>
              <Text variant="bodyMedium">
                {habit.todayTarget > 0
                  ? `${habit.todayGoodCount}/${habit.todayTarget}`
                  : '-'}
              </Text>

              <Text
                variant="bodyMedium"
                style={styles.summary__habit__effectiveness}>
                {habit.todayPercentage !== null
                  ? `${habit.todayPercentage}%`
                  : '-'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const hasText = !!aiSummary;

  return (
    <>
      <NowComponent
        iconContent={<InfoCircle end />}
        subtitleContent={
          <Text variant="titleMedium">{t('summary.subtitle')}</Text>
        }
        titleContent={<Text variant="titleLarge">{t('summary.title')}</Text>}
        textContent={
          <>
            {renderHabitsList()}
            {hasText ? (
              <View style={styles.summary__container}>
                <Text variant="bodyMedium" style={styles.summary__text}>
                  {aiSummary}
                </Text>
              </View>
            ) : null}
          </>
        }
        buttonsContent={renderButton()}
      />
      <View style={styles.gap} />
    </>
  );
};

export default EndCard;
