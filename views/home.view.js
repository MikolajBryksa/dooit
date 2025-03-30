import React, {useState, useEffect} from 'react';
import {ScrollView, View} from 'react-native';
import {Appbar, Text, Card, Divider, Chip, Button} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useStyles} from '../styles';
import HabitCard from '../components/habit.card';
import {getFormattedTime} from '../utils';
import {setHabits} from '../redux/actions';
import {getEveryHabit} from '../services/habits.service';
import {addProgressToHabits, getHabitsByDay} from '../utils';
import ViewEnum from '../enum/view.enum';
import {setSelectedDay} from '../redux/actions';
import {formatDateToYYMMDD, getDayOfWeek} from '../utils';
import CalendarModal from '../modals/calendar.modal';
import AddHabitModal from '../modals/addHabit.modal';
import {updateTempValue} from '../services/temp.service';

const HomeView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const habits = useSelector(state => state.habits);
  const selectedDay = useSelector(state => state.selectedDay);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [visibleAddModal, setVisibleAddModal] = useState(false);
  const [visibleCalendarModal, setVisibleCalendarModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => getFormattedTime());

  const handleAddModal = () => {
    setVisibleAddModal(!visibleAddModal);
  };

  const handleCalendarModal = () => {
    setVisibleCalendarModal(!visibleCalendarModal);
  };

  const fetchHabitsWithProgress = () => dispatch => {
    const habits = getEveryHabit() || [];
    const habitsWithProgress = addProgressToHabits(habits);
    dispatch(setHabits(habitsWithProgress));
  };

  useEffect(() => {
    dispatch(fetchHabitsWithProgress());
  }, [selectedDay]);

  const filterHabitsByDays = () => {
    if (habits || habits.length > 0) {
      const filteredHabits = getHabitsByDay(habits, selectedDay);
      setFilteredHabits(filteredHabits);
    }
  };

  useEffect(() => {
    filterHabitsByDays(selectedDay);
  }, [habits, selectedDay]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = getFormattedTime();
      const currentDay = formatDateToYYMMDD();
      setCurrentTime(currentTime);
      if (currentTime >= '03:00' && currentDay !== selectedDay) {
        dispatch(setSelectedDay(currentDay));
        updateTempValue('selectedDay', currentDay);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedDay]);

  const markHabitsByTime = (habits, currentTime) => {
    return habits.map(habit => ({
      ...habit,
      inactive: habit.habitStart >= currentTime,
    }));
  };

  useEffect(() => {
    if (selectedDay === formatDateToYYMMDD()) {
      const markedHabits = markHabitsByTime(habits, currentTime);
      setFilteredHabits(markedHabits);
    }
  }, [habits, currentTime]);

  return (
    <>
      <AddHabitModal
        visible={visibleAddModal}
        onDismiss={handleAddModal}
        fetchHabitsWithProgress={() => dispatch(fetchHabitsWithProgress())}
      />

      <CalendarModal
        visible={visibleCalendarModal}
        onDismiss={handleCalendarModal}
        setSelectedDay={day => dispatch(setSelectedDay(day))}
      />

      <Appbar.Header>
        <Appbar.Content title={t('view.home')} />
        <Chip>{t(`date.${getDayOfWeek(selectedDay)}`)}</Chip>
        <Appbar.Action
          icon="calendar"
          onPress={() => {
            handleCalendarModal();
          }}
        />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        {filteredHabits && filteredHabits.length > 0 ? (
          filteredHabits.map(habit => (
            <HabitCard
              key={habit.id}
              id={habit.id}
              view={ViewEnum.PREVIEW}
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
              inactive={habit.inactive}
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

      {/* <ScrollView style={styles.container}>
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
      </ScrollView> */}
    </>
  );
};

export default HomeView;
