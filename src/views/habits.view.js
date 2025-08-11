import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {View, ScrollView} from 'react-native';
import {Appbar, Text, Card, Chip} from 'react-native-paper';
import HabitCard from '@/components/habit.card';
import AddModal from '@/modals/add.modal';
import {getHabits} from '@/services/habits.service';
import {setHabits} from '@/redux/actions';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';

const HabitsView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const habits = useSelector(state => state.habits);
  const [sortedHabits, setSortedHabits] = useState([]);
  const [visibleAddModal, setVisibleAddModal] = useState(false);

  const handleAddModal = () => {
    setVisibleAddModal(!visibleAddModal);
  };

  const fetchHabits = () => {
    const habits = getHabits() || [];
    dispatch(setHabits(habits));
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const getNextAvailableTime = repeatHours => {
    if (!repeatHours || repeatHours.length === 0) {
      return '99:99';
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const futureHours = repeatHours.filter(hour => hour && hour > currentTime);

    if (futureHours.length > 0) {
      const sorted = futureHours.sort();
      return sorted[0] || '99:99';
    } else {
      const validHours = repeatHours.filter(hour => hour);
      const sorted = validHours.sort();
      return sorted[0] || '99:99';
    }
  };

  const sortHabits = () => {
    if (habits && habits.length > 0) {
      const sortedHabits = habits.slice().sort((a, b) => {
        if (a.available !== b.available) {
          return a.available ? -1 : 1;
        }

        const aNextTime = getNextAvailableTime(a.repeatHours);
        const bNextTime = getNextAvailableTime(b.repeatHours);

        return aNextTime.localeCompare(bNextTime);
      });
      setSortedHabits(sortedHabits);
    }
  };

  useEffect(() => {
    sortHabits();
  }, [habits]);

  return (
    <>
      <Appbar.Header style={styles.topBar__shadow}>
        <Appbar.Content title={t('view.habits')} />

        <Appbar.Action
          icon="plus"
          onPress={() => {
            handleAddModal();
          }}
        />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        {sortedHabits && sortedHabits.length > 0 ? (
          sortedHabits.map(habit => (
            <HabitCard
              key={habit.id}
              id={habit.id}
              habitName={habit.habitName}
              goodChoice={habit.goodChoice}
              badChoice={habit.badChoice}
              score={habit.score}
              level={habit.level}
              duration={habit.duration}
              repeatDays={habit.repeatDays}
              repeatHours={habit.repeatHours}
              available={habit.available}
              fetchHabits={fetchHabits}
            />
          ))
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

export default HabitsView;
