import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import {setHabits, setPlans} from '../redux/actions';
import {getEveryHabit} from '../services/habits.service';
import {getEveryPlan} from '../services/plans.service';
import {getTemp, updateTemp} from '../services/temp.service';
import {styles} from '../styles';
import {convertToISO} from '../utils';
import HabitsModal from '../modals/habits.modal';
import PlansModal from '../modals/plans.modal';
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import realm from '../storage/schemas';
import HabitItem from '../items/habit.item';
import PlanItem from '../items/plan.item';
import {useTranslation} from 'react-i18next';

const HabitsView = () => {
  const habits = useSelector(state => state.habits);
  const plans = useSelector(state => state.plans);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [play, setPlay] = useState(false);
  const [endDay, setEndDay] = useState(false);
  const [currentHabit, setCurrentHabit] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState(habits);
  const [todayPlans, setTodayPlans] = useState([]);
  const [tomorrowPlans, setTomorrowPlans] = useState([]);

  useEffect(() => {
    async function fetchTemp() {
      const temp = getTemp();
      if (temp) {
        setCurrentHabit(habits.find(item => item.id === temp.habitId));
        setCurrentIndex(temp.habitId - 1);
        setPlay(temp.habitPlay);
      }
    }
    fetchTemp();
  }, [habits]);

  useEffect(() => {
    async function fetchData() {
      const habits = getEveryHabit();
      const formattedHabits = habits.map(item => ({
        ...item,
        what: item.what,
        when: item.when,
      }));
      dispatch(setHabits(formattedHabits));
      setData(formattedHabits);

      const plans = getEveryPlan();
      const formattedPlans = plans.map(item => ({
        ...item,
        what: item.what,
        when: convertToISO(new Date(item.when).toLocaleDateString()),
      }));
      dispatch(setPlans(formattedPlans));
    }
    fetchData();
  }, [showModal]);

  useEffect(() => {
    const today = new Date();

    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startOfTomorrow = new Date(today);
    startOfTomorrow.setDate(today.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);
    const endOfTomorrow = new Date(today);
    endOfTomorrow.setDate(today.getDate() + 1);
    endOfTomorrow.setHours(23, 59, 59, 999);

    if (Array.isArray(plans) && plans.length > 0) {
      const todaysPlans = plans.filter(plan => {
        const planDate = new Date(plan.when);
        return planDate >= startOfDay && planDate <= endOfDay;
      });
      const tomorrowsPlans = plans.filter(plan => {
        const planDate = new Date(plan.when);
        return planDate >= startOfTomorrow && planDate <= endOfTomorrow;
      });
      setTodayPlans(todaysPlans);
      setTomorrowPlans(tomorrowsPlans);
    } else {
      setTodayPlans([]);
      setTomorrowPlans([]);
    }
  }, [plans]);

  function handleAdd() {
    setShowModal(true);
  }

  function handlePlay() {
    setCurrentHabit(habits[0]);
    setCurrentIndex(0);
    setPlay(true);
    updateTemp(0, true);
  }

  function handleStop() {
    setPlay(false);
    setEndDay(false);
    updateTemp(0, false);
  }

  function handleDone() {
    const newIndex = (currentIndex + 1) % habits.length;
    if (newIndex === 0) {
      setEndDay(true);
      updateTemp(0, false);
    } else {
      setCurrentHabit(habits[newIndex]);
      setCurrentIndex(newIndex);
      updateTemp(habits[newIndex].id, true);
    }
  }

  const renderItem = useCallback(({item, index, drag, isActive}) => {
    return (
      <HabitItem
        key={index}
        id={item.id}
        when={item.when}
        what={item.what}
        drag={drag}
        isActive={isActive}
        setShowModal={setShowModal}
      />
    );
  }, []);

  const handleDragEnd = ({data}) => {
    const newData = data.map((item, index) => {
      return {...item, when: index + 1};
    });
    setData(newData);
    realm.write(() => {
      newData.forEach(item => {
        let habit = realm.objectForPrimaryKey('Habit', item.id);
        if (habit) {
          habit.when = item.when;
        }
      });
    });
    dispatch(setHabits(newData));
  };

  const plansToShow = !endDay ? todayPlans : tomorrowPlans;
  const headerText = !endDay ? currentHabit?.what : t('done-habits');

  return (
    <View style={styles.container}>
      {play && showModal && <PlansModal setShowModal={setShowModal} />}
      {!play && showModal && <HabitsModal setShowModal={setShowModal} />}
      {habits && !play && (
        <>
          <View style={styles.header}>
            <Text style={styles.center}>
              {habits.length > 0 ? t('play-habits') : t('no-habits')}
            </Text>
          </View>

          <GestureHandlerRootView style={styles.scrollView}>
            <DraggableFlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={item => `draggable-item-${item.id}`}
              onDragEnd={handleDragEnd}
            />
          </GestureHandlerRootView>

          <View style={styles.controllers}>
            <ControlButton
              type="play"
              press={handlePlay}
              disabled={habits.length === 0}
            />
            <ControlButton type="add" press={handleAdd} />
          </View>
        </>
      )}
      {habits && play && (
        <>
          <View style={styles.header}>
            <Text style={styles.center}>{headerText}</Text>
          </View>

          <ScrollView style={styles.scrollView}>
            {plansToShow.map((item, index) => (
              <PlanItem
                key={index}
                id={item.id}
                when={item.when}
                what={item.what}
                time={item.time}
                setShowModal={setShowModal}
              />
            ))}
          </ScrollView>
          {!endDay ? (
            <View style={styles.controllers}>
              <ControlButton type="stop" press={handleStop} />
              <ControlButton type="accept" press={handleDone} />
            </View>
          ) : (
            <View style={styles.controllers}>
              <ControlButton type="accept" press={handleStop} />
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default HabitsView;
