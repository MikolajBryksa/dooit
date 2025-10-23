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
} from '@/services/habits.service';
import {setHabits} from '@/redux/actions';
import NowCard from '@/components/now.card';
import EndCard from '@/components/end.card';
import NoHabitsCard from '@/components/no-habits.card';

const HomeView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const habits = useSelector(state => state.habits);
  const debugMode = useSelector(state => state.settings.debugMode);
  const cardDuration = useSelector(state => state.settings.cardDuration);
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
    // Updates the list of habits after changing the date
    (async () => {
      const LAST_RESET_DATE = 'habits:lastResetDate';
      const lastDate = await AsyncStorage.getItem(LAST_RESET_DATE);

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

  useEffect(() => {
    // Manages habit completion state and active card switching

    if (todayHabits.length === 0) {
      setAllCompleted(false);
      return;
    }

    const hasIncompleteHabits = todayHabits.some(
      habit => !habit.completedHours.includes(habit.selectedHour),
    );

    // If activeKey doesn't exist anymore (habit was removed/changed) - reset immediately
    const activeKeyExists =
      activeKey !== null && todayHabits.some(habit => habit.key === activeKey);

    if (activeKey !== null && !activeKeyExists) {
      setActiveKey(firstActiveKeyCandidate);
      if (firstActiveKeyCandidate === null && todayHabits.length > 0) {
        setAllCompleted(true);
      }
      return;
    }

    // Only set allCompleted immediately if we're not transitioning from an active card
    if (!hasIncompleteHabits && activeKey === null) {
      setAllCompleted(true);
      return;
    } else if (hasIncompleteHabits) {
      setAllCompleted(false);
    }

    // If coming back from allCompleted state and we have a new habit to show, show it immediately
    if (
      activeKey === null &&
      firstActiveKeyCandidate !== null &&
      allCompleted
    ) {
      setActiveKey(firstActiveKeyCandidate);
      return;
    }

    if (activeKey === null && firstActiveKeyCandidate !== null) {
      setActiveKey(firstActiveKeyCandidate);
      return;
    }

    if (firstActiveKeyCandidate !== activeKey) {
      const id = setTimeout(() => {
        setActiveKey(firstActiveKeyCandidate);
        // If no more active habits, mark as completed after animation
        if (firstActiveKeyCandidate === null && todayHabits.length > 0) {
          setAllCompleted(true);
        } else if (firstActiveKeyCandidate !== null) {
          setAllCompleted(false);
        }
      }, cardDuration * 1000);
      return () => clearTimeout(id);
    }
  }, [
    todayHabits,
    firstActiveKeyCandidate,
    activeKey,
    cardDuration,
    allCompleted,
  ]);

  useEffect(() => {
    // Creates notifications for next 3 days to ensure they work even if app isn't opened daily
    (async () => {
      await notifee.createChannel({
        id: 'default',
        name: 'Dooit Channel',
      });

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
              notifee.createTriggerNotification(
                {
                  title: `${hour} ${habit.habitName}`,
                  body: pickRandomMotivation(t, 'notification'),
                  android: {
                    channelId: 'default',
                    smallIcon: 'ic_notification',
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
  }, [habits]);

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
        {todayHabits.length === 0 ? (
          <NoHabitsCard />
        ) : allCompleted ? (
          <EndCard weekdayKey={weekdayKey} />
        ) : (
          todayHabits.map(habit => (
            <NowCard
              key={habit.key}
              id={habit.id}
              habitName={habit.habitName}
              habitEnemy={habit.habitEnemy}
              goodCounter={habit.goodCounter}
              badCounter={habit.badCounter}
              skipCounter={habit.skipCounter}
              repeatDays={habit.repeatDays}
              repeatHours={habit.repeatHours}
              completedHours={habit.completedHours}
              selectedHour={habit.selectedHour}
              icon={habit.icon}
              isNext={habit.key === activeKey}
              onUpdated={refreshHabits}
              globalProgressValue={globalProgressValue}
            />
          ))
        )}
        <View style={styles.gap} />
      </ScrollView>
    </>
  );
};

export default HomeView;
