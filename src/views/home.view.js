import React, {useMemo, useEffect, useCallback, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {ScrollView, View} from 'react-native';
import {Appbar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {TriggerType} from '@notifee/react-native';
import {useStyles} from '@/styles';
import {hourToSec, dateToWeekday, pickRandomMotivation} from '@/utils';
import {useTodayKey} from '@/hooks';
import {
  getHabits,
  resetCompletedHoursForAllHabits,
  autoSkipPastHabits,
} from '@/services/habits.service';
import {setHabits, setHabitsLoading} from '@/redux/actions';
import NowCard from '@/components/now.card';
import EndCard from '@/components/end.card';
import NoHabitsCard from '@/components/no-habits.card';
import LoadingHabitsCard from '@/components/loading-habits.card';

const HomeView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const habits = useSelector(state => state.habits);
  const habitsLoading = useSelector(state => state.habitsLoading);
  const debugMode = useSelector(state => state.settings.debugMode);
  const [activeKey, setActiveKey] = useState(null);
  const [allCompleted, setAllCompleted] = useState(false);

  const refreshHabits = useCallback(() => {
    // Updates the list of habits after changing one
    const newHabits = getHabits() || [];
    dispatch(setHabits(newHabits));
  }, [dispatch]);

  // Updates the date every minute
  const todayKey = useTodayKey();

  // Calculate weekday key once for today
  const weekdayKey = useMemo(() => dateToWeekday(todayKey), [todayKey]);

  useEffect(() => {
    // On mount, auto-skip past habits and load habits immediately
    autoSkipPastHabits(weekdayKey);
    refreshHabits();
  }, []);

  useEffect(() => {
    // Show loading briefly only on first render
    dispatch(setHabitsLoading(true));
    const timer = setTimeout(() => {
      dispatch(setHabitsLoading(false));
    }, 500);

    return () => {
      clearTimeout(timer);
      // Ensure loading is cleared when component unmounts
      dispatch(setHabitsLoading(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array - run only on mount

  useEffect(() => {
    // Updates the list of habits after changing the date
    (async () => {
      const LAST_RESET_DATE = 'habits:lastResetDate';
      const lastDate = await AsyncStorage.getItem(LAST_RESET_DATE);

      if (lastDate === null) {
        await AsyncStorage.setItem(LAST_RESET_DATE, todayKey);
        return; // no reset on Day 1
      }
      if (lastDate !== todayKey) {
        resetCompletedHoursForAllHabits();
        await AsyncStorage.setItem(LAST_RESET_DATE, todayKey);
        refreshHabits();
      }
    })();
  }, [todayKey, refreshHabits]);

  const todayHabits = useMemo(() => {
    // Creates today's habits

    if (!habits || habits.length === 0) return [];

    const filteredHabits = habits.filter(
      // Filters habits into those that are available today
      habit => habit.available && habit.repeatDays.includes(weekdayKey),
    );

    const expandedHabits = filteredHabits.flatMap(habit =>
      // Expands habits for repeat hours and sorts them
      habit.repeatHours.map((hour, idx) => ({
        key: `${habit.id}__${idx}__${hour}`,
        id: habit.id,
        habitName: habit.habitName,
        habitEnemy: habit.habitEnemy,
        goodCounter: habit.goodCounter,
        badCounter: habit.badCounter,
        skipCounter: habit.skipCounter,
        repeatDays: habit.repeatDays,
        repeatHours: habit.repeatHours,
        completedHours: habit.completedHours || [],
        selectedHour: hour,
        icon: habit.icon,
      })),
    );

    expandedHabits.sort(
      (a, b) => hourToSec(a.selectedHour) - hourToSec(b.selectedHour),
    );

    return expandedHabits;
  }, [habits, todayKey]);

  const globalProgressValue = useMemo(() => {
    // Calculate global progress for all habits scheduled for today
    if (!todayHabits || todayHabits.length === 0) {
      return 0;
    }

    const totalPlanned = todayHabits.length;
    const totalCompleted = todayHabits.filter(habit =>
      habit.completedHours.includes(habit.selectedHour),
    ).length;

    const value = totalCompleted / totalPlanned;
    return Math.max(0, Math.min(1, value));
  }, [todayHabits]);

  const firstActiveKeyCandidate = useMemo(() => {
    // Selects the key of the first incomplete habit for today
    for (const habit of todayHabits) {
      const done = habit.completedHours.includes(habit.selectedHour);
      if (!done) return habit.key;
    }
    return null;
  }, [todayHabits]);

  const activeHabit = useMemo(() => {
    // Get the currently active habit object
    return todayHabits.find(habit => habit.key === activeKey) || null;
  }, [todayHabits, activeKey]);

  const isLastHabit = useMemo(() => {
    // Check if current habit is the last incomplete one
    return firstActiveKeyCandidate === null;
  }, [firstActiveKeyCandidate]);

  useEffect(() => {
    // Manages habit completion state and active card
    if (todayHabits.length === 0) {
      setAllCompleted(false);
      setActiveKey(null);
      return;
    }

    const hasIncompleteHabits = todayHabits.some(
      habit => !habit.completedHours.includes(habit.selectedHour),
    );

    // If activeKey doesn't exist anymore (habit was removed/changed) - reset to first incomplete
    const activeKeyExists =
      activeKey !== null && todayHabits.some(habit => habit.key === activeKey);

    if (activeKey !== null && !activeKeyExists) {
      setActiveKey(firstActiveKeyCandidate);
      return;
    }

    // Set initial activeKey if none is set
    if (activeKey === null && firstActiveKeyCandidate !== null) {
      setActiveKey(firstActiveKeyCandidate);
      setAllCompleted(false);
      return;
    }

    // Don't auto-complete - wait for user to click Finish button
  }, [todayHabits, firstActiveKeyCandidate, activeKey]);

  // Handler for moving to next card - called by Next/Finish button
  const handleNextCard = useCallback(() => {
    if (firstActiveKeyCandidate === null && todayHabits.length > 0) {
      // No more incomplete habits - show EndCard
      setAllCompleted(true);
    } else {
      // Move to next habit
      setActiveKey(firstActiveKeyCandidate);
    }
  }, [firstActiveKeyCandidate, todayHabits]);

  useEffect(() => {
    // Creates notifications for next 3 days to ensure they work even if app isn't opened daily
    (async () => {
      await notifee.createChannel({
        id: 'default',
        name: 'Dooit Channel',
      });

      // Cancel all existing notifications to prevent duplicates
      await notifee.cancelAllNotifications();

      const now = new Date();

      for (let daysAhead = 0; daysAhead < 3; daysAhead++) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + daysAhead);
        const weekdayKey = dateToWeekday(
          `${targetDate.getFullYear()}-${String(
            targetDate.getMonth() + 1,
          ).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`,
        );

        if (!habits || habits.length === 0) continue;

        const dayHabits = habits.filter(
          habit => habit.available && habit.repeatDays.includes(weekdayKey),
        );

        dayHabits.forEach(habit => {
          habit.repeatHours.forEach(hour => {
            const [h, m] = hour.split(':').map(Number);
            const triggerDate = new Date(
              targetDate.getFullYear(),
              targetDate.getMonth(),
              targetDate.getDate(),
              h,
              m || 0,
              0,
              0,
            );

            // Only schedule if time is in the future
            if (triggerDate > now) {
              // Create unique ID for each notification to prevent duplicates
              const notificationId = `${habit.id}-${targetDate.getFullYear()}-${
                targetDate.getMonth() + 1
              }-${targetDate.getDate()}-${hour}`;

              notifee.createTriggerNotification(
                {
                  id: notificationId,
                  title: `${hour} ${habit.habitName}`,
                  body: pickRandomMotivation(t, 'notification'),
                  android: {
                    channelId: 'default',
                    smallIcon: 'ic_notification',
                    pressAction: {
                      id: 'default',
                      launchActivity: 'default',
                    },
                  },
                },
                {
                  type: TriggerType.TIMESTAMP,
                  timestamp: triggerDate.getTime(),
                },
              );
            }
          });
        });
      }
    })();
  }, [habits, t]);

  return (
    <>
      <Appbar.Header style={styles.topBar__shadow}>
        <Appbar.Content title={t('view.home')} />
        {debugMode && (
          <Appbar.Action
            icon="refresh"
            onPress={() => {
              resetCompletedHoursForAllHabits();
              refreshHabits();
            }}
          />
        )}
      </Appbar.Header>

      <ScrollView style={styles.container}>
        {habitsLoading ? (
          <LoadingHabitsCard />
        ) : todayHabits.length === 0 ? (
          <NoHabitsCard />
        ) : allCompleted ? (
          <EndCard weekdayKey={weekdayKey} />
        ) : activeHabit ? (
          <>
            <NowCard
              key={activeHabit.key}
              id={activeHabit.id}
              habitName={activeHabit.habitName}
              habitEnemy={activeHabit.habitEnemy}
              goodCounter={activeHabit.goodCounter}
              badCounter={activeHabit.badCounter}
              skipCounter={activeHabit.skipCounter}
              repeatDays={activeHabit.repeatDays}
              repeatHours={activeHabit.repeatHours}
              completedHours={activeHabit.completedHours}
              selectedHour={activeHabit.selectedHour}
              icon={activeHabit.icon}
              isNext={true}
              isLastHabit={isLastHabit}
              onUpdated={refreshHabits}
              onNext={handleNextCard}
              globalProgressValue={globalProgressValue}
            />
          </>
        ) : null}
      </ScrollView>
    </>
  );
};

export default HomeView;
