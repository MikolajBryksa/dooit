import React, {useMemo, useEffect, useCallback, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {ScrollView, View} from 'react-native';
import {Appbar, Card, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {hourToSec, dateToWeekday} from '@/utils';
import {useTodayKey} from '@/hooks';
import {
  getHabits,
  resetCompletedHoursForAllHabits,
} from '@/services/habits.service';
import {setHabits} from '@/redux/actions';
import NowCard from '@/components/now.card';

const HomeView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const habits = useSelector(state => state.habits);
  const debugMode = useSelector(state => state.settings.debugMode);

  const refreshHabits = useCallback(() => {
    // Updates the list of habits after changing one
    const newHabits = getHabits() || [];
    dispatch(setHabits(newHabits));
  }, [dispatch]);

  const todayKey = useTodayKey();

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
    // Filters habits into those that are available today
    // Expands habits for repeat hours and sorts them
    if (!habits || habits.length === 0) return [];

    const weekdayKey = dateToWeekday(todayKey);

    const filteredHabits = habits.filter(
      habit => habit.available && habit.repeatDays.includes(weekdayKey),
    );

    const expandedHabits = filteredHabits.flatMap(habit =>
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

  const firstActiveKeyCandidate = useMemo(() => {
    for (const habit of todayHabits) {
      const done = habit.completedHours.includes(habit.selectedHour);
      if (!done) return habit.key;
    }
    return null;
  }, [todayHabits]);

  const [activeKey, setActiveKey] = useState(null);
  const ADVANCE_DELAY_MS = 2000;

  useEffect(() => {
    if (activeKey === null && firstActiveKeyCandidate !== null) {
      setActiveKey(firstActiveKeyCandidate);
      return;
    }
    if (firstActiveKeyCandidate !== activeKey) {
      const id = setTimeout(
        () => setActiveKey(firstActiveKeyCandidate),
        ADVANCE_DELAY_MS,
      );
      return () => clearTimeout(id);
    }
  }, [firstActiveKeyCandidate, activeKey]);

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
          <Card style={styles.card}>
            <Card.Content style={styles.card__title}>
              <Text variant="titleMedium">{t('title.no-habits')}</Text>
            </Card.Content>
          </Card>
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
            />
          ))
        )}
        <View style={styles.gap} />
      </ScrollView>
    </>
  );
};

export default HomeView;
