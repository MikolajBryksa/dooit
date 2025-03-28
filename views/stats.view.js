import React, {useState, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {ScrollView, View} from 'react-native';
import {Appbar, Text, Button, Card, Divider} from 'react-native-paper';
import HabitCard from '../components/habit.card';
import ViewEnum from '../enum/view.enum';
import AddHabitModal from '../modals/addHabit.modal';
import FilterHabitModal from '../modals/filterHabit.modal';
import {useTranslation} from 'react-i18next';
import {useStyles} from '../styles';
import {setHabits} from '../redux/actions';
import {getEveryHabit} from '../services/habits.service';
import {getProgressByHabitId} from '../services/progress.service';
import {useFocusEffect} from '@react-navigation/native';

const StatsView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const habits = useSelector(state => state.habits);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [visibleAddModal, setVisibleAddModal] = useState(false);
  const [visibleFilterModal, setVisibleFilterModal] = useState(false);

  const handleAddModal = () => {
    setVisibleAddModal(!visibleAddModal);
  };

  const handleFilterModal = () => {
    setVisibleFilterModal(!visibleFilterModal);
  };

  const fetchHabitsWithProgress = () => dispatch => {
    const habits = getEveryHabit() || [];

    const habitsWithProgress = habits.map(habit => {
      const progressData = getProgressByHabitId(habit.id);
      const progress = progressData
        ? progressData.map(p => ({
            ...p,
            date: p.date ? p.date.toISOString() : null,
          }))
        : undefined;

      const serializableRepeatDays = habit.repeatDays
        ? JSON.stringify(habit.repeatDays)
        : '[]';

      return {
        ...habit,
        ...(progress !== undefined && {progress}),
        repeatDays: serializableRepeatDays,
      };
    });
    dispatch(setHabits(habitsWithProgress));
  };

  const filterHabitsByDays = days => {
    if (!habits || habits.length === 0) {
      setFilteredHabits([]);
      return;
    }
    const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    if (!days) days = daysOfWeek;

    const filtered = habits.filter(habit => {
      const repeatDaysArray = habit.repeatDays
        ? JSON.parse(habit.repeatDays)
        : [];
      return days.some(day => repeatDaysArray.includes(day));
    });
    setFilteredHabits(filtered);
  };

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchHabitsWithProgress());
      filterHabitsByDays();
    }, [dispatch]),
  );

  return (
    <>
      <AddHabitModal
        visible={visibleAddModal}
        onDismiss={handleAddModal}
        fetchHabitsWithProgress={() => dispatch(fetchHabitsWithProgress())}
      />

      <FilterHabitModal
        visible={visibleFilterModal}
        onDismiss={handleFilterModal}
        filterHabitsByDays={filterHabitsByDays}
      />

      <Appbar.Header>
        <Appbar.Content title={t('view.stats')} />
        <Appbar.Action
          icon="filter"
          onPress={() => {
            handleFilterModal();
          }}
        />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        {filteredHabits && filteredHabits.length > 0 ? (
          filteredHabits.map(habit => (
            <HabitCard
              key={habit.id}
              id={habit.id}
              view={ViewEnum.STATS}
              habitName={habit.habitName}
              firstStep={habit.firstStep}
              goalDesc={habit.goalDesc}
              motivation={habit.motivation}
              repeatDays={habit.repeatDays}
              habitStart={habit.habitStart}
              progressType={habit.progressType}
              progressUnit={habit.progressUnit}
              targetScore={habit.targetScore}
              progress={habit.progress}
              fetchHabitsWithProgress={() =>
                dispatch(fetchHabitsWithProgress())
              }
            />
          ))
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.title}>
                <Text variant="titleLarge">{t('title.no-habits')}</Text>
              </View>
              <Divider style={styles.divider} />
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => {
                  handleAddModal();
                }}>
                {t('button.add')}
              </Button>
            </Card.Actions>
          </Card>
        )}
        <View style={styles.gap} />
      </ScrollView>
    </>
  );
};

export default StatsView;
