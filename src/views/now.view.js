import React, {useMemo, useEffect, useRef, useState, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {ScrollView, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useStyles} from '@/styles';
import {dateToWeekday} from '@/utils';
import {
  useTodayKey,
  useCurrentTime,
  useActiveHabit,
  useDoubleBackExit,
} from '@/hooks';
import {useIsFocused} from '@react-navigation/native';
import {getHabits, getTodayHabits} from '@/services/habits.service';
import {backfillTodaySkippedExecutions} from '@/services/executions.service';
import {
  updateStreakIfNeeded,
  checkStreakBreak,
} from '@/services/settings.service';
import {syncUserData} from '@/services/supabase.service';
import {
  scheduleHabitNotifications,
  scheduleStreakReminder,
} from '@/services/notifications.service';
import {setHabits, setHabitsLoading, setSettings} from '@/redux/actions';
import {Icon, Text} from 'react-native-paper';
import NowCard from '@/cards/now.card';
import SummaryCard from '@/cards/summary.card';
import EmptyCard from '@/cards/empty.card';
import LoadingCard from '@/cards/loading.card';
import StartCard from '@/cards/start.card';
import {logError} from '@/services/errors.service';
import AddModal from '@/modals/add.modal';
import Topbar from '@/components/topbar.component';
import TipComponent from '@/components/tip.component';

const NowView = () => {
  const {t} = useTranslation();
  const isFocused = useIsFocused();
  useDoubleBackExit(isFocused);
  const styles = useStyles();
  const dispatch = useDispatch();

  const habits = useSelector(state => state.habits);
  const habitsLoading = useSelector(state => state.habitsLoading);
  const firstLaunch = useSelector(state => state.settings.firstLaunch);
  const userName = useSelector(state => state.settings.userName);
  const streakCount = useSelector(state => state.settings.streakCount ?? 0);
  const lastStreakDate = useSelector(state => state.settings.lastStreakDate);

  const [visibleAddModal, setVisibleAddModal] = useState(false);

  const handleAddModal = () => {
    setVisibleAddModal(!visibleAddModal);
  };

  // Auto-show SummaryCard after 23:50
  const currentTime = useCurrentTime();
  const isEndDay = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return hours === 23 && minutes >= 50;
  }, [currentTime]);

  // Current date key and weekday key
  const todayKey = useTodayKey();
  const weekdayKey = useMemo(() => dateToWeekday(todayKey), [todayKey]);

  const handleDone = useCallback(() => {
    const updated = updateStreakIfNeeded(todayKey);
    if (updated) {
      dispatch(setSettings(updated));
      syncUserData(habits, updated.streakCount);
    }
  }, [todayKey, dispatch, habits]);

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
    rebuildTodayHabits();
    const updated = checkStreakBreak(todayKey);
    if (updated) dispatch(setSettings(updated));
  }, [rebuildTodayHabits, todayKey, dispatch]);

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
      try {
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
      } catch (e) {
        logError(e, 'now.dateChangeCheck');
      }
    })();
  }, [todayKey, rebuildTodayHabits]);

  const endDayBackfillDoneRef = useRef(null);
  useEffect(() => {
    if (!isEndDay || endDayBackfillDoneRef.current === todayKey) return;
    endDayBackfillDoneRef.current = todayKey;
    backfillTodaySkippedExecutions(habits);
  }, [isEndDay, todayKey, habits]);

  const todayHabits = useMemo(
    () => getTodayHabits(habits, weekdayKey),
    [habits, weekdayKey],
  );

  const {activeHabit, isLastHabit, allCompleted, goToNextHabit} =
    useActiveHabit(todayHabits, todayKey);

  useEffect(() => {
    (async () => {
      await scheduleHabitNotifications(habits, t);
      scheduleStreakReminder(lastStreakDate, t);
    })();
  }, [habits, t, lastStreakDate]);

  return (
    <>
      <Topbar>
        <Topbar.Content title={t('view.now')} />
        {streakCount > 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 16,
            }}>
            <Icon source="fire" size={24} />
            <Text variant="titleMedium" style={{marginLeft: 4}}>
              {streakCount}
            </Text>
          </View>
        )}
      </Topbar>

      <ScrollView style={styles.container}>
        {firstLaunch ? (
          <StartCard />
        ) : habitsLoading ? (
          <LoadingCard />
        ) : todayHabits.length === 0 ? (
          <EmptyCard onAddHabit={handleAddModal} />
        ) : allCompleted || isEndDay ? (
          <SummaryCard weekdayKey={weekdayKey} />
        ) : activeHabit ? (
          <>
            <TipComponent tipId="now_first_habit">
              {t('tip.now-first-habit', {userName})}
            </TipComponent>
            <NowCard
              key={activeHabit.key}
              id={activeHabit.id}
              habitName={activeHabit.habitName}
              selectedHour={activeHabit.selectedHour}
              slotIndex={activeHabit.slotIndex}
              icon={activeHabit.icon}
              goal={activeHabit.goal}
              isNext={true}
              isLastHabit={isLastHabit}
              onUpdated={refreshHabits}
              onDone={handleDone}
              onNext={goToNextHabit}
            />
          </>
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
