import React, {useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import {Appbar, Card, Text} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {hourToSec} from '@/utils';
import {useTodayKey} from '@/hooks';
import NowCard from '@/components/now.card';

const HomeView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const habits = useSelector(state => state.habits);

  const todayKey = useTodayKey();

  const todayHabits = useMemo(() => {
    if (!habits || habits.length === 0) return [];

    const filteredHabits = habits.filter(
      habit =>
        habit.available &&
        Array.isArray(habit.repeatDays) &&
        habit.repeatDays.includes(todayKey),
    );

    const expandedHabits = filteredHabits.flatMap(habit =>
      habit.repeatHours.map((hour, idx) => ({
        key: `${habit.id}__${idx}__${hour}`,
        id: habit.id,
        habitName: habit.habitName,
        habitEnemy: habit.habitEnemy,
        score: habit.score,
        level: habit.level,
        repeatDays: habit.repeatDays,
        repeatHours: habit.repeatHours,
        selectedHour: hour,
        icon: habit.icon,
      })),
    );

    expandedHabits.sort(
      (a, b) => hourToSec(a.selectedHour) - hourToSec(b.selectedHour),
    );
    return expandedHabits;
  }, [habits, todayKey]);

  return (
    <>
      <Appbar.Header style={styles.topBar__shadow}>
        <Appbar.Content title={t('view.home')} />
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
              score={habit.score}
              level={habit.level}
              repeatHours={habit.repeatHours}
              selectedHour={habit.selectedHour}
              icon={habit.icon}
            />
          ))
        )}
        <View style={styles.gap} />
      </ScrollView>
    </>
  );
};

export default HomeView;
