import React, {useState, useCallback, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {ScrollView, View} from 'react-native';
import {Appbar, Text, Button, Card, Divider} from 'react-native-paper';
import HabitCard from '@/components/habit.card';
import ViewEnum from '@/enum/view.enum';
import AddHabitModal from '@/modals/addHabit.modal';
import FilterHabitModal from '@/modals/filterHabit.modal';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {setHabits} from '@/redux/actions';
import {getEveryHabit} from '@/services/habits.service';
import {addProgressToHabits, getHabitsByDays} from '@/utils';
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
    const habitsWithProgress = addProgressToHabits(habits);
    dispatch(setHabits(habitsWithProgress));
  };

  const filterHabitsByDays = days => {
    if (habits || habits.length > 0) {
      const filteredHabits = getHabitsByDays(habits, days);
      setFilteredHabits(filteredHabits);
    }
  };

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchHabitsWithProgress());
    }, [dispatch]),
  );

  useEffect(() => {
    filterHabitsByDays();
  }, [habits]);

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

      <Appbar.Header style={styles.topBar__shadow}>
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
