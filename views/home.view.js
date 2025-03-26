import React, {useMemo, useState, useEffect, useCallback} from 'react';
import {ScrollView, View} from 'react-native';
import {Appbar, Text, Card, Divider, Chip} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useStyles} from '../styles';
import HabitCard from '../components/habit.card';
import {getFormattedTime} from '../utils';
import {setHabits} from '../redux/actions';
import {getEveryHabit} from '../services/habits.service';
import {getProgressByHabitId} from '../services/progress.service';
import ViewEnum from '../enum/view.enum';
import {useFocusEffect} from '@react-navigation/native';
import {setSelectedDay} from '../redux/actions';
import {formatDateToYYMMDD, getDayOfWeek} from '../utils';

const HomeView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const habits = useSelector(state => state.habits);
  const selectedDay = useSelector(state => state.selectedDay);
  const [currentTime, setCurrentTime] = useState(() => getFormattedTime());
  const [currentDay, setCurrentDay] = useState(() => formatDateToYYMMDD());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getFormattedTime());
      if (currentDay !== formatDateToYYMMDD()) {
        setCurrentDay(formatDateToYYMMDD());
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const isCurrentHabit = (currentTime, habitStart, nextHabitStart) => {
    return (
      currentTime >= habitStart &&
      (!nextHabitStart || currentTime < nextHabitStart)
    );
  };

  const currentHabit = useMemo(() => {
    if (!habits || habits.length === 0) return null;

    for (let i = 0; i < habits.length; i++) {
      const habit = habits[i];
      const nextHabit = habits[i + 1];
      if (
        isCurrentHabit(currentTime, habit.habitStart, nextHabit?.habitStart)
      ) {
        return habit;
      }
    }

    return null;
  }, [habits, currentTime]);

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title={t('views.home')} />
        <Chip icon="calendar" style={styles.date}>
          {t(`date.${getDayOfWeek(currentDay)}`)}
        </Chip>
      </Appbar.Header>

      <ScrollView style={styles.container}>
        {currentHabit && selectedDay === currentDay ? (
          <HabitCard
            key={currentHabit.id}
            id={currentHabit.id}
            view={ViewEnum.PREVIEW}
            habitName={currentHabit.habitName}
            firstStep={currentHabit.firstStep}
            goalDesc={currentHabit.goalDesc}
            motivation={currentHabit.motivation}
            repeatDays={currentHabit.repeatDays}
            habitStart={currentHabit.habitStart}
            progressType={currentHabit.progressType}
            progressUnit={currentHabit.progressUnit}
            targetScore={currentHabit.targetScore}
            progress={currentHabit.progress}
            fetchHabitsWithProgress={() => dispatch(fetchHabitsWithProgress())}
          />
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.title}>
                <Text variant="titleLarge">{t('title.no-current-habit')}</Text>
              </View>
              <Divider style={styles.divider} />
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </>
  );
};

export default HomeView;
