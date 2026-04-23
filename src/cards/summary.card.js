import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {Text, IconButton, Icon, useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {useStyles} from '@/styles';
import {useTodayKey} from '@/hooks';
import {generateTemplateSummary, saveSummary} from '@/services/summary.service';
import {logError} from '@/services/errors.service';
import {getTodayGoalStats, getHabitsForSync} from '@/services/habits.service';
import NowComponent from '../components/now.component';
import InfoCircle from '../circles/info.circle';
import TipComponent from '../components/tip.component';

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
      todayDoneCount: stats.todayDoneCount,
      todaySkippedCount: stats.todaySkippedCount,
      todayAttemptedCount: stats.todayAttemptedCount,
      todayRemainingCount: stats.todayRemainingCount,
      todayPercentage: stats.todayPercentage,
    };
  });

const sortForUi = (a, b) => {
  const percA = a.todayPercentage ?? -1;
  const percB = b.todayPercentage ?? -1;
  if (percB !== percA) return percB - percA;

  const goodA = a.todayDoneCount ?? 0;
  const goodB = b.todayDoneCount ?? 0;
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

  const goodA = a.todayDoneCount ?? 999;
  const goodB = b.todayDoneCount ?? 999;
  if (goodA !== goodB) return goodA - goodB;

  const remainingA = a.todayRemainingCount ?? -1;
  const remainingB = b.todayRemainingCount ?? -1;
  if (remainingB !== remainingA) return remainingB - remainingA;

  return String(a.habitName).localeCompare(String(b.habitName));
};

let lastBestHabitId = null;
let lastWorstHabitId = null;

const pickSummaryInputs = habitsWithStats => {
  const withTargets = habitsWithStats.filter(h => (h.todayTarget ?? 0) > 0);

  if (withTargets.length === 0) {
    return {bestHabit: null, worstHabit: null};
  }

  const sorted = [...withTargets].sort(sortForUi);
  const topPercentage = sorted[0].todayPercentage;
  const topCandidates = sorted.filter(h => h.todayPercentage === topPercentage);
  const freshBestCandidates = topCandidates.filter(
    h => h.id !== lastBestHabitId,
  );
  const bestPool =
    freshBestCandidates.length > 0 ? freshBestCandidates : topCandidates;
  const bestHabit = bestPool[Math.floor(Math.random() * bestPool.length)];
  lastBestHabitId = bestHabit.id;

  if (withTargets.length <= 1) {
    return {bestHabit, worstHabit: null};
  }

  const sortedWorst = [...withTargets].sort(sortForWorst);
  const bottomPercentage = sortedWorst[0].todayPercentage;

  if (bottomPercentage >= bestHabit.todayPercentage) {
    return {bestHabit, worstHabit: null};
  }

  const bottomCandidates = sortedWorst.filter(
    h => h.todayPercentage === bottomPercentage,
  );
  const freshWorstCandidates = bottomCandidates.filter(
    h => h.id !== lastWorstHabitId,
  );
  const worstPool =
    freshWorstCandidates.length > 0 ? freshWorstCandidates : bottomCandidates;
  const worstHabit = worstPool[Math.floor(Math.random() * worstPool.length)];
  lastWorstHabitId = worstHabit.id;

  return {bestHabit, worstHabit};
};

const SummaryCard = ({weekdayKey}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const theme = useTheme();

  const habits = useSelector(state => state.habits);
  const streakCount = useSelector(state => state.settings.streakCount ?? 0);
  const todayKey = useTodayKey();

  const todayHabits = useMemo(
    () => habits.filter(h => h.repeatDays.includes(weekdayKey)),
    [habits, weekdayKey],
  );

  const todayHabitsWithStats = useMemo(
    () => withTodayStats(todayHabits, todayKey, weekdayKey),
    [todayHabits, todayKey, weekdayKey],
  );

  const sortedHabitsUi = useMemo(
    () => [...todayHabitsWithStats].sort(sortForUi),
    [todayHabitsWithStats],
  );

  const summary = useMemo(() => {
    if (todayHabits.length === 0) {
      return t('summary.no-actions');
    }
    const {bestHabit, worstHabit} = pickSummaryInputs(todayHabitsWithStats);
    return generateTemplateSummary(t, bestHabit, worstHabit);
  }, [todayHabits.length, todayHabitsWithStats, t]);

  useEffect(() => {
    saveSummary(getHabitsForSync(habits), streakCount).catch(e =>
      logError(e, 'EndCard.saveSummary'),
    );
  }, [todayKey]); // eslint-disable-line react-hooks/exhaustive-deps

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
              {habit.todayPercentage === 100 ? (
                <Icon source="check" size={20} color={theme.colors.success} />
              ) : habit.todayPercentage === 0 ? (
                <Icon source="close" size={20} color={theme.colors.error} />
              ) : (
                <Text
                  variant="bodyMedium"
                  style={styles.summary__habit__effectiveness}>
                  {habit.todayTarget > 0
                    ? `${habit.todayDoneCount}/${habit.todayTarget}`
                    : '-'}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <>
      <TipComponent tipId="summary_daily_recap">
        {t('tip.summary-daily-recap')}
      </TipComponent>
      <NowComponent
        iconContent={<InfoCircle end />}
        subtitleContent={
          <Text variant="titleMedium">{t('summary.subtitle')}</Text>
        }
        titleContent={<Text variant="titleLarge">{t('summary.title')}</Text>}
        textContent={
          <>
            {renderHabitsList()}
            <View style={styles.summary__container}>
              <Text variant="bodyMedium" style={styles.summary__text}>
                {summary}
              </Text>
            </View>
          </>
        }
        buttonsContent={null}
      />
      <View style={styles.gap} />
    </>
  );
};

export default SummaryCard;
