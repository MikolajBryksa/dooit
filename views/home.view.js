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
      const currentDay = formatDateToYYMMDD();
      if (currentDay !== selectedDay) {
        dispatch(setSelectedDay(currentDay));
        updateTempValue('selectedDay', currentDay);
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [selectedDay]);

  useEffect(() => {
    const currentDay = formatDateToYYMMDD();
    dispatch(setSelectedDay(currentDay));
    updateTempValue('selectedDay', currentDay);
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = getFormattedTime();
      setCurrentTime(currentTime);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const markHabitByTime = (habit, currentTime) => {
    if (selectedDay === formatDateToYYMMDD()) {
      return {
        ...habit,
        active: habit.habitStart <= currentTime,
      };
    } else {
      return {
        ...habit,
        active: false,
      };
    }
  };

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

      <Appbar.Header style={styles.topBar__shadow}>
        <Appbar.Content title={t('view.home')} />
        <Chip
          onPress={() => {
            handleCalendarModal();
          }}>
          {t(`date.${getDayOfWeek(selectedDay)}`)}
        </Chip>
        <Appbar.Action
          icon="calendar"
          onPress={() => {
            handleCalendarModal();
          }}
        />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        {filteredHabits && filteredHabits.length > 0 ? (
          filteredHabits.map(habit => {
            const markedHabit = markHabitByTime(habit, currentTime);
            return (
              <HabitCard
                key={markedHabit.id}
                id={markedHabit.id}
                view={ViewEnum.PREVIEW}
                habitName={markedHabit.habitName}
                firstStep={markedHabit.firstStep}
                goalDesc={markedHabit.goalDesc}
                motivation={markedHabit.motivation}
                repeatDays={markedHabit.repeatDays}
                habitStart={markedHabit.habitStart}
                progressType={markedHabit.progressType}
                progressUnit={markedHabit.progressUnit}
                targetScore={markedHabit.targetScore}
                progress={markedHabit.progress}
                active={markedHabit.active}
                fetchHabitsWithProgress={() =>
                  dispatch(fetchHabitsWithProgress())
                }
              />
            );
          })
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

export default HomeView;
