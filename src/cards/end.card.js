import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {Text, IconButton} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {useStyles} from '@/styles';
import {useTodayKey} from '@/hooks';
import {generateTemplateSummary, saveSummary} from '@/services/summary.service';
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

const pickSummaryInputs = habitsWithStats => {
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

  const sortedHabitsUi = useMemo(
    () => [...todayHabitsWithStats].sort(sortForUi),
    [todayHabitsWithStats],
  );

  const summary = useMemo(() => {
    if (todayHabits.length === 0) {
      return t('summary.no-actions');
    }
    const {mode, bestHabit, worstHabit} =
      pickSummaryInputs(todayHabitsWithStats);
    return generateTemplateSummary(t, mode, bestHabit, worstHabit);
  }, [todayHabits.length, todayHabitsWithStats, t]);

  useEffect(() => {
    saveSummary(allHabitsWithStats).catch(e =>
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

export default EndCard;
