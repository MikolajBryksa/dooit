import React, {useMemo, useEffect, useState, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {ScrollView} from 'react-native';
import {Appbar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useStyles} from '@/styles';
import {dateToWeekday} from '@/utils';
import {useTodayKey, useCurrentTime, useActiveHabit} from '@/hooks';
import {
  getHabits,
  resetCompletedHoursForAllHabits,
  autoSkipPastHabits,
  getTodayHabits,
  calculateGlobalProgress,
} from '@/services/habits.service';
import {setHabits, setHabitsLoading} from '@/redux/actions';
import NowCard from '@/components/now.card';
import EndCard from '@/components/end.card';
import NoHabitsCard from '@/components/no-habits.card';
import LoadingHabitsCard from '@/components/loading-habits.card';
import {scheduleHabitNotifications} from '@/services/notifications.service';
import AddModal from '@/modals/add.modal';

const HomeView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();

  const habits = useSelector(state => state.habits);
  const habitsLoading = useSelector(state => state.habitsLoading);
  const debugMode = useSelector(state => state.settings.debugMode);

  const [visibleAddModal, setVisibleAddModal] = useState(false);

  const handleAddModal = () => {
    setVisibleAddModal(!visibleAddModal);
  };

  // Auto-show EndCard after 23:50
  const currentTime = useCurrentTime();
  const isEndDay = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return hours === 23 && minutes >= 50;
  }, [currentTime]);

  // Current date key and weekday key
  const todayKey = useTodayKey();
  const weekdayKey = useMemo(() => dateToWeekday(todayKey), [todayKey]);

  const refreshHabits = useCallback(() => {
    const newHabits = getHabits() || [];
    dispatch(setHabits(newHabits));
  }, [dispatch]);

  const rebuildTodayHabits = useCallback(async () => {
    dispatch(setHabitsLoading(true));

    autoSkipPastHabits(weekdayKey);
    refreshHabits();

    setTimeout(() => {
      dispatch(setHabitsLoading(false));
    }, 500);
  }, [weekdayKey, refreshHabits, dispatch]);

  useEffect(() => {
    // On mount: auto-skip past habits and load habits immediately
    rebuildTodayHabits();
  }, [rebuildTodayHabits]);

  useEffect(() => {
    // Show a short loading indicator when opening the screen
    dispatch(setHabitsLoading(true));
    const timer = setTimeout(() => {
      dispatch(setHabitsLoading(false));
    }, 500);

    return () => {
      clearTimeout(timer);
      dispatch(setHabitsLoading(false));
    };
  }, [dispatch]);

  useEffect(() => {
    // Reset completedHours when the date changes (new day)
    (async () => {
      const LAST_RESET_DATE = 'habits:lastResetDate';
      const lastDate = await AsyncStorage.getItem(LAST_RESET_DATE);

      if (lastDate === null) {
        // First run: save today's date, do not reset
        await AsyncStorage.setItem(LAST_RESET_DATE, todayKey);
        return;
      }

      if (lastDate !== todayKey) {
        resetCompletedHoursForAllHabits();
        await AsyncStorage.setItem(LAST_RESET_DATE, todayKey);
        rebuildTodayHabits();
      }
    })();
  }, [todayKey, rebuildTodayHabits]);

  const todayHabits = useMemo(
    () => getTodayHabits(habits, weekdayKey),
    [habits, weekdayKey],
  );

  const globalProgressValue = useMemo(
    () => calculateGlobalProgress(todayHabits),
    [todayHabits],
  );

  const {activeHabit, isLastHabit, allCompleted, goToNextHabit} =
    useActiveHabit(todayHabits, currentTime);

  useEffect(() => {
    // Keep scheduled notifications in sync with current habits
    scheduleHabitNotifications(habits, t);
  }, [habits, t]);

  return (
    <>
      <Appbar.Header style={styles.topBar__shadow}>
        <Appbar.Content title={t('view.home')} />

        <Appbar.Action
          icon="refresh"
          onPress={() => {
            rebuildTodayHabits();
          }}
        />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        {habitsLoading ? (
          <LoadingHabitsCard />
        ) : todayHabits.length === 0 ? (
          <NoHabitsCard onAddHabit={handleAddModal} />
        ) : allCompleted || isEndDay ? (
          <EndCard weekdayKey={weekdayKey} />
        ) : activeHabit ? (
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
            onNext={goToNextHabit}
            globalProgressValue={globalProgressValue}
          />
        ) : null}
      </ScrollView>

      <AddModal
        visible={visibleAddModal}
        onDismiss={handleAddModal}
        fetchAllHabits={rebuildTodayHabits}
      />
    </>
  );
};

export default HomeView;
