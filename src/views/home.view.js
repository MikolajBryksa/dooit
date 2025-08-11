import React, {useState, useEffect, useCallback} from 'react';
import {TriggerType} from '@notifee/react-native';
import {ScrollView, View} from 'react-native';
import {Appbar, Text, Card, Chip, useTheme} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import NowCard from '@/components/now.card';
import PlanDialog from '@/dialogs/plan.dialog';
import {setHabits, setCurrentItem} from '@/redux/actions';
import {getHabits} from '@/services/habits.service';
import {updateSettingValue} from '@/services/settings.service';
import {getFormattedTime, timeStringToSeconds} from '@/utils';
import {dayMap, dayFullMap} from '@/constants';
import notifee from '@notifee/react-native';

const HomeView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const habits = useSelector(state => state.habits);
  const currentDay = useSelector(state => state.settings.currentDay);
  const currentHabitIndex = useSelector(state =>
    typeof state.currentItem === 'number' ? state.currentItem : 0,
  );
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [todayKey, setTodayKey] = useState('');
  const [visiblePlanDialog, setVisiblePlanDialog] = useState(false);

  const handlePlanDialog = () => {
    setVisiblePlanDialog(!visiblePlanDialog);
  };

  const setCurrentItemAll = useCallback(
    value => {
      dispatch(setCurrentItem(value));
      updateSettingValue('currentItem', value);
    },
    [dispatch],
  );

  useEffect(() => {
    const updateDateTime = () => {
      setCurrentTime(getFormattedTime(false));
      const jsDay = new Date().getDay();
      setTodayKey(dayMap[jsDay]);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (
      todayKey &&
      currentDay &&
      todayKey !== currentDay &&
      currentHabitIndex === -1
    ) {
      dispatch({type: 'SET_SETTINGS', payload: {currentDay: todayKey}});
      updateSettingValue('currentDay', todayKey);
      fetchHabits();
      setCurrentItemAll(0);
    }
  }, [todayKey, currentDay, currentHabitIndex, dispatch]);

  const fetchHabits = () => {
    const habits = getHabits() || [];
    dispatch(setHabits(habits));
  };

  const moveToNextHabit = useCallback(() => {
    const totalHabits = filteredHabits.length;
    if (totalHabits === 0) {
      setCurrentItemAll(-1);
      return;
    }
    if (currentHabitIndex + 1 >= totalHabits) {
      setCurrentItemAll(-1);
    } else {
      const nextIndex = currentHabitIndex + 1;
      setCurrentItemAll(nextIndex);
    }
  }, [filteredHabits.length, currentHabitIndex, dispatch]);

  useEffect(() => {
    fetchHabits();
  }, []);

  const filterHabits = () => {
    if (habits && habits.length > 0) {
      const availableHabits = habits.filter(
        habit =>
          habit.available &&
          habit.repeatDays &&
          habit.repeatDays.includes(todayKey),
      );

      const expandedHabits = [];

      availableHabits.forEach(habit => {
        if (habit.repeatHours && habit.repeatHours.length > 0) {
          habit.repeatHours.forEach((hour, index) => {
            expandedHabits.push({
              ...habit,
              id: `${habit.id}_${index}`,
              originalId: habit.id,
              originalRepeatHours: habit.repeatHours,
              currentHour: hour,
              repeatHours: [hour],
            });
          });
        } else {
          expandedHabits.push({
            ...habit,
            originalId: habit.id,
            originalRepeatHours: habit.repeatHours,
            currentHour: null,
          });
        }
      });

      const sortedHabits = expandedHabits.sort((a, b) => {
        if (!a.currentHour && !b.currentHour) return 0;
        if (!a.currentHour) return 1;
        if (!b.currentHour) return -1;
        return a.currentHour.localeCompare(b.currentHour);
      });

      setFilteredHabits(sortedHabits);
    } else {
      setFilteredHabits([]);
    }
  };

  useEffect(() => {
    filterHabits();
  }, [habits, todayKey]);

  useEffect(() => {
    if (filteredHabits.length === 0 && currentHabitIndex !== -1) {
      setCurrentItemAll(-1);
    } else if (
      filteredHabits.length > 0 &&
      currentHabitIndex >= filteredHabits.length
    ) {
      setCurrentItemAll(-1);
    }
  }, [filteredHabits.length, currentHabitIndex]);

  useEffect(() => {
    if (filteredHabits.length > 0) {
      if (currentHabitIndex >= filteredHabits.length) {
        setCurrentItemAll(0);
        return;
      }

      if (currentHabitIndex < 0) {
        setCurrentItemAll(0);
        return;
      }

      const currentHabit = filteredHabits[currentHabitIndex];
      if (!currentHabit?.available) {
        const nextAvailableIndex = filteredHabits.findIndex(
          (habit, index) => index > currentHabitIndex && habit.available,
        );

        if (nextAvailableIndex !== -1) {
          setCurrentItemAll(nextAvailableIndex);
        } else {
          const firstAvailableIndex = filteredHabits.findIndex(
            habit => habit.available,
          );
          if (firstAvailableIndex !== -1) {
            setCurrentItemAll(firstAvailableIndex);
          } else {
            setCurrentItemAll(-1);
          }
        }
      }
    } else if (currentHabitIndex !== -1) {
      setCurrentItemAll(-1);
    }
  }, [filteredHabits.length]);

  useEffect(() => {
    (async () => {
      await notifee.createChannel({
        id: 'default',
        name: 'Dooit Channel',
      });

      await notifee.cancelAllNotifications();

      const now = new Date();
      filteredHabits.forEach(habit => {
        if (habit.currentHour) {
          const [hour, minute] = habit.currentHour.split(':').map(Number);
          const triggerDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hour,
            minute,
            0,
            0,
          );
          if (triggerDate > now) {
            notifee.createTriggerNotification(
              {
                title: `${habit.currentHour} ${habit.habitName}`,
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
        }
      });
    })();
  }, [filteredHabits]);

  const currentHabit =
    filteredHabits.length > 0 &&
    typeof currentHabitIndex === 'number' &&
    currentHabitIndex >= 0 &&
    currentHabitIndex < filteredHabits.length
      ? filteredHabits[currentHabitIndex]
      : null;

  return (
    <>
      <Appbar.Header style={styles.topBar__shadow}>
        <Appbar.Content title={t('view.home')} />

        <Appbar.Action
          icon="format-list-bulleted"
          onPress={() => {
            handlePlanDialog();
          }}
        />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        {currentHabitIndex === -1 ? (
          <Card style={styles.card}>
            <Card.Content style={styles.card__title}>
              <Text variant="titleMedium">{t('card.done')}</Text>
            </Card.Content>
          </Card>
        ) : currentHabit ? (
          <NowCard
            key={currentHabit.id}
            id={currentHabit.originalId || currentHabit.id}
            habitName={currentHabit.habitName}
            goodChoice={currentHabit.goodChoice}
            badChoice={currentHabit.badChoice}
            score={currentHabit.score}
            level={currentHabit.level}
            duration={currentHabit.duration}
            repeatDays={currentHabit.repeatDays}
            repeatHours={currentHabit.repeatHours}
            originalRepeatHours={currentHabit.originalRepeatHours}
            available={currentHabit.available}
            fetchHabits={fetchHabits}
            onChoice={moveToNextHabit}
            active={
              !currentHabit.currentHour ||
              timeStringToSeconds(currentHabit.currentHour) <=
                timeStringToSeconds(currentTime)
            }
          />
        ) : null}

        {currentHabitIndex === -1 && (
          <Card style={styles.card}>
            <Card.Content style={styles.card__title}>
              <Chip
                icon="refresh"
                mode="outlined"
                onPress={() => {
                  setCurrentItemAll(0);
                  fetchHabits();
                }}
                style={styles.chip}>
                {t('card.start')}
              </Chip>
            </Card.Content>
          </Card>
        )}

        <View style={styles.gap} />
      </ScrollView>

      <PlanDialog
        visible={visiblePlanDialog}
        onDismiss={handlePlanDialog}
        filteredHabits={filteredHabits}
        currentHabitIndex={currentHabitIndex}
        currentDay={currentDay}
      />
    </>
  );
};

export default HomeView;
