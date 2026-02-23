import React, {useMemo, useEffect, useState, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useStyles} from '@/styles';
import {dateToWeekday} from '@/utils';
import {useTodayKey, useCurrentTime, useActiveHabit} from '@/hooks';
import {getHabits, getTodayHabits} from '@/services/habits.service';
import {setHabits, setHabitsLoading} from '@/redux/actions';
import NowCard from '@/cards/now.card';
import EndCard from '@/cards/end.card';
import EmptyCard from '@/cards/empty.card';
import LoadingCard from '@/cards/loading.card';
import StartCard from '@/cards/start.card';
import {scheduleHabitNotifications} from '@/services/notifications.service';
import AddModal from '@/modals/add.modal';
import Topbar from '@/components/topbar.component';

const NowView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();

  const habits = useSelector(state => state.habits);
  const habitsLoading = useSelector(state => state.habitsLoading);
  const firstLaunch = useSelector(state => state.settings.firstLaunch);

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
    refreshHabits();
    setTimeout(() => {
      dispatch(setHabitsLoading(false));
    }, 500);
  }, [refreshHabits, dispatch]);

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
    // Check if date changed and rebuild habits for new day
    (async () => {
      const LAST_RESET_DATE = 'habits:lastResetDate';
      const lastDate = await AsyncStorage.getItem(LAST_RESET_DATE);

      if (lastDate === null) {
        // First run: save today's date
        await AsyncStorage.setItem(LAST_RESET_DATE, todayKey);
        return;
      }

      if (lastDate !== todayKey) {
        // New day: rebuild habits
        await AsyncStorage.setItem(LAST_RESET_DATE, todayKey);
        rebuildTodayHabits();
      }
    })();
  }, [todayKey, rebuildTodayHabits]);

  const todayHabits = useMemo(
    () => getTodayHabits(habits, weekdayKey),
    [habits, weekdayKey],
  );

  const {activeHabit, isLastHabit, allCompleted, goToNextHabit} =
    useActiveHabit(todayHabits, todayKey);

  useEffect(() => {
    // Keep scheduled notifications in sync with current habits
    scheduleHabitNotifications(habits, t);
  }, [habits, t]);

  return (
    <>
      <Topbar>
        <Topbar.Content title={t('view.now')} />
      </Topbar>

      <ScrollView style={styles.container}>
        {firstLaunch ? (
          <StartCard />
        ) : habitsLoading ? (
          <LoadingCard />
        ) : todayHabits.length === 0 ? (
          <EmptyCard onAddHabit={handleAddModal} />
        ) : allCompleted || isEndDay ? (
          <EndCard weekdayKey={weekdayKey} />
        ) : activeHabit ? (
          <NowCard
            key={activeHabit.key}
            id={activeHabit.id}
            habitName={activeHabit.habitName}
            goodCounter={activeHabit.goodCounter}
            badCounter={activeHabit.badCounter}
            repeatDays={activeHabit.repeatDays}
            repeatHours={activeHabit.repeatHours}
            selectedHour={activeHabit.selectedHour}
            icon={activeHabit.icon}
            isNext={true}
            isLastHabit={isLastHabit}
            onUpdated={refreshHabits}
            onNext={goToNextHabit}
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

export default NowView;
