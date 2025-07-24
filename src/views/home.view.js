import React, {useState, useEffect, useCallback} from 'react';
import {ScrollView, View} from 'react-native';
import {Appbar, Text, Card, Chip} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import NowCard from '@/components/now.card';
import AddModal from '@/modals/add.modal';
import {setHabits, setCurrentItem} from '@/redux/actions';
import {getHabits} from '@/services/habits.service';

const HomeView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const habits = useSelector(state => state.habits);
  const currentHabitIndex = useSelector(state => state.currentItem || 0);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [visibleAddModal, setVisibleAddModal] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const handleAddModal = () => {
    setVisibleAddModal(!visibleAddModal);
  };

  const fetchHabits = () => {
    const habits = getHabits() || [];
    dispatch(setHabits(habits));
  };

  const moveToNextHabit = useCallback(() => {
    const totalHabits = filteredHabits.length;
    if (totalHabits === 0) {
      dispatch(setCurrentItem(0));
      return;
    }
    if (currentHabitIndex + 1 >= totalHabits) {
      setShowCongrats(true);
    } else {
      dispatch(setCurrentItem(currentHabitIndex + 1));
    }
  }, [filteredHabits.length, currentHabitIndex, dispatch]);

  useEffect(() => {
    fetchHabits();
  }, []);

  const filterHabits = () => {
    if (habits && habits.length > 0) {
      const availableHabits = habits.filter(habit => habit.available);

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
  }, [habits]);

  useEffect(() => {
    if (
      filteredHabits.length > 0 &&
      currentHabitIndex >= filteredHabits.length
    ) {
    }
  }, [filteredHabits, currentHabitIndex, dispatch]);

  const currentHabit =
    filteredHabits.length > 0 && currentHabitIndex < filteredHabits.length
      ? filteredHabits[currentHabitIndex]
      : null;

  return (
    <>
      <Appbar.Header style={styles.topBar__shadow}>
        <Appbar.Content title={t('view.home')} />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        {showCongrats ? (
          <Card style={styles.card}>
            <Card.Content style={styles.card__title}>
              <Text variant="titleMedium">{t('card.congrats')}</Text>
              <Chip
                icon="trophy"
                mode="outlined"
                onPress={() => {
                  setShowCongrats(false);
                  dispatch(setCurrentItem(0));
                  fetchHabits();
                }}
                style={styles.chip}>
                {t('card.done')}
              </Chip>
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
            currentStreak={currentHabit.currentStreak}
            level={currentHabit.level}
            desc={currentHabit.desc}
            message={currentHabit.message}
            repeatDays={currentHabit.repeatDays}
            repeatHours={currentHabit.repeatHours}
            originalRepeatHours={currentHabit.originalRepeatHours}
            available={currentHabit.available}
            fetchHabits={fetchHabits}
            onChoice={moveToNextHabit}
          />
        ) : (
          <Card style={styles.card}>
            <Card.Content style={styles.card__title}>
              <Text variant="titleMedium">{t('title.no-habits')}</Text>
              <Chip
                icon="plus"
                mode="outlined"
                onPress={handleAddModal}
                style={styles.chip}>
                {t(`title.add`)}
              </Chip>
            </Card.Content>
          </Card>
        )}
        <View style={styles.gap} />
      </ScrollView>

      <AddModal
        visible={visibleAddModal}
        onDismiss={handleAddModal}
        fetchHabits={fetchHabits}
      />
    </>
  );
};

export default HomeView;
