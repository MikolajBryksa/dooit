import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {View} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Text,
  IconButton,
  Icon,
} from 'react-native-paper';
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
import {
  calculateEffectiveness,
  calculateEffectivenessUpToDate,
} from '@/services/executions.service';
import {subtractDays} from '@/utils';
import NowComponent from '../components/now.component';
import InfoCircle from '../circles/info.circle';

const withEffectiveness = habits =>
  habits.map(h => {
    const stats = calculateEffectiveness(h.id); // "facts", independent of current plan
    return {
      id: h.id,
      habitName: h.habitName,
      repeatDays: h.repeatDays,
      repeatHours: h.repeatHours,
      effectiveness: stats.effectiveness,
      totalCount: stats.totalCount,
    };
  });

const sortForUi = (a, b) => {
  const effA = a.effectiveness ?? -1;
  const effB = b.effectiveness ?? -1;
  if (effB !== effA) return effB - effA;

  const cntA = a.totalCount ?? 0;
  const cntB = b.totalCount ?? 0;
  if (cntB !== cntA) return cntB - cntA;

  const chA = a.change ?? 0;
  const chB = b.change ?? 0;
  if (chB !== chA) return chB - chA;

  return String(a.habitName).localeCompare(String(b.habitName));
};

const pickAiInputs = habitsWithChanges => {
  const anyData = habitsWithChanges.some(h => (h.totalCount ?? 0) > 0);
  if (!anyData) {
    return {mode: 'no-data', bestHabit: null, worstHabit: null};
  }

  const candidates = habitsWithChanges
    .filter(h => h.change !== null && h.change !== 0 && (h.totalCount ?? 0) > 0)
    .sort((a, b) => (b.change ?? 0) - (a.change ?? 0));

  if (candidates.length === 0) {
    // stable day: no clear improvement/decrease
    const bestByEff =
      [...habitsWithChanges].sort(
        (a, b) => (b.effectiveness ?? -1) - (a.effectiveness ?? -1),
      )[0] || null;

    return {mode: 'stable', bestHabit: bestByEff, worstHabit: null};
  }

  if (candidates.length === 1) {
    return {mode: 'improved', bestHabit: candidates[0], worstHabit: null};
  }

  const bestHabit = candidates[0];
  const worstHabit = candidates[candidates.length - 1];
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

  const habitsWithChanges = useMemo(() => {
    if (todayHabitsWithEff.length === 0) return [];

    const yesterday = subtractDays(todayKey, 1);

    return todayHabitsWithEff.map(habit => {
      const yesterdayStats = calculateEffectivenessUpToDate(
        habit.id,
        yesterday,
      );

      let change = null;
      if (
        habit.effectiveness !== null &&
        yesterdayStats.effectiveness !== null
      ) {
        change = habit.effectiveness - yesterdayStats.effectiveness;
      }

      return {...habit, change};
    });
  }, [todayHabitsWithEff, todayKey]);

  const sortedHabitsUi = useMemo(() => {
    return [...habitsWithChanges].sort(sortForUi);
  }, [habitsWithChanges]);

  useEffect(() => {
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

  const handleGenerate = useCallback(async () => {
    if (loadingAI || todayHabitsWithEff.length === 0 || !isConnected) return;

    setLoadingAI(true);
    setHadError(false);
    setAiSummary('');

    try {
      const {mode, bestHabit, worstHabit} = pickAiInputs(habitsWithChanges);

      const response = await generateAiSummary(mode, bestHabit, worstHabit);
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
  }, [
    loadingAI,
    todayHabitsWithEff.length,
    isConnected,
    habitsWithChanges,
    todayKey,
    allAvailableHabitsWithEff,
    t,
  ]);

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

  const renderHabitsList = () => {
    if (sortedHabitsUi.length === 0) return null;

    return (
      <View style={styles.summary__habits}>
        {sortedHabitsUi.map(habit => {
          const habitData = habits.find(h => h.id === habit.id);
          const icon = habitData?.icon || 'infinity';
          const showChange = habit.change !== null && habit.change !== 0;

          return (
            <View key={habit.id} style={styles.summary__habit}>
              <IconButton
                icon={icon}
                size={20}
                style={styles.summary__habit__icon}
              />
              <Text variant="bodyMedium" style={styles.summary__habit__name}>
                {habit.habitName}
              </Text>
              <View style={styles.summary__habit__stats}>
                {showChange ? (
                  <>
                    <Text variant="bodyMedium">
                      {habit.change > 0 ? '+' : ''}
                      {habit.change}%
                    </Text>
                    <Icon
                      source={habit.change > 0 ? 'arrow-up' : 'arrow-down'}
                      size={14}
                    />
                  </>
                ) : null}
                <Text
                  variant="bodyMedium"
                  style={styles.summary__habit__effectiveness}>
                  {habit.effectiveness !== null
                    ? `${habit.effectiveness}%`
                    : '-'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const hasText = !!aiSummary;

  return (
    <NowComponent
      customStyle={styles.summary__card}
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
  );
};

export default EndCard;
