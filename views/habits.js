import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Control from '../components/Control';
import Table from '../components/Table';
import {setHabits, setModalName} from '../redux/actions';
import {getEveryItem} from '../storage/services';
import {styles} from '../styles';

const Habits = () => {
  const habits = useSelector(state => state.habits);
  const plans = useSelector(state => state.plans);
  const modalName = useSelector(state => state.modalName);
  const dispatch = useDispatch();
  const [play, setPlay] = useState(false);
  const [currentHabit, setCurrentHabit] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [todayPlans, setTodayPlans] = useState([]);

  async function fetchData() {
    const data = getEveryItem('habit', false);
    const formattedData = data.map(item => ({
      ...item,
      what: item.what,
      when: item.when,
    }));
    dispatch(setHabits(formattedData));
  }

  useEffect(() => {
    fetchData();
  }, [modalName]);

  useEffect(() => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    if (Array.isArray(plans) && plans.length > 0) {
      const todaysPlans = plans.filter(plan => {
        const planDate = new Date(plan.when);
        return planDate >= startOfDay && planDate <= endOfDay;
      });
      setTodayPlans(todaysPlans);
    } else {
      setTodayPlans([]);
    }
  }, [plans]);

  function handleAdd() {
    dispatch(setModalName('habit'));
  }

  function handlePlay() {
    setCurrentHabit(habits[0]);
    setPlay(true);
  }

  function handleStop() {
    setPlay(false);
  }

  function handleDone() {
    const newIndex = (currentIndex + 1) % habits.length;
    setCurrentHabit(habits[newIndex]);
    setCurrentIndex(newIndex);
  }

  return (
    <View style={styles.container}>
      {habits && !play && (
        <>
          <Table items={habits} name="habit" />
          <View style={styles.controllers}>
            <Control type="play" press={handlePlay} />
            <Control type="add" press={handleAdd} />
          </View>
        </>
      )}
      {habits && play && (
        <>
          <View style={styles.info}>
            <Text style={styles.center}>{currentHabit.what}</Text>
          </View>
          <Table items={todayPlans} name="plan" />
          <View style={styles.controllers}>
            <Control type="stop" press={handleStop} />
            <Control type="accept" press={handleDone} />
          </View>
        </>
      )}
    </View>
  );
};

export default Habits;
