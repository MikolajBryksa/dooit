import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useSelector} from 'react-redux';
import {styles} from '../styles';
import {formatDateWithDay} from '../utils';
import HomeItem from '../items/home.item';
import PlansModal from '../modals/plans.modal';
import HabitsModal from '../modals/habits.modal';
import DayModal from '../modals/day.modal';
import {getTodayPlans} from '../services/plans.service';
import {getTodayHabits} from '../services/habits.service';
import ControlButton from '../components/control.button';

const HomeView = () => {
  const selectedDay = useSelector(state => state.selectedDay);
  const plans = useSelector(state => state.plans);
  const habits = useSelector(state => state.habits);
  const settings = useSelector(state => state.settings);
  const [todayPlans, setTodayPlans] = useState([]);
  const [todayHabits, setTodayHabits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('');

  useEffect(() => {
    const fetchTodayData = async () => {
      const todayPlans = getTodayPlans(selectedDay);
      setTodayPlans(todayPlans);

      const todayHabits = getTodayHabits(selectedDay);
      setTodayHabits(todayHabits);
    };

    fetchTodayData();
  }, [selectedDay, showModal, plans, habits]);

  function handleFinishDay() {
    setMode('finish');
    setShowModal(true);
  }

  return (
    <View style={styles.container}>
      {mode === 'plan' && showModal && (
        <PlansModal setShowModal={setShowModal} />
      )}
      {mode === 'habit' && showModal && (
        <HabitsModal setShowModal={setShowModal} />
      )}
      {mode === 'finish' && showModal && (
        <DayModal setShowModal={setShowModal} />
      )}

      <View style={styles.header}>
        <Text style={styles.center}>
          {formatDateWithDay(selectedDay, settings.language)}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {todayPlans.map((item, index) => (
          <HomeItem
            key={index}
            type="plan"
            item={item}
            setShowModal={setShowModal}
            setMode={setMode}
          />
        ))}
        {todayPlans.length > 0 && todayHabits.length > 0 && (
          <View style={styles.gap} />
        )}
        {todayHabits.map((item, index) => (
          <HomeItem
            key={index}
            type="habit"
            item={item}
            setShowModal={setShowModal}
            setMode={setMode}
          />
        ))}
      </ScrollView>

      <View style={styles.controllers}>
        <ControlButton type="finish" press={handleFinishDay} />
      </View>
    </View>
  );
};

export default HomeView;
