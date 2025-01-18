import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useSelector} from 'react-redux';
import {styles} from '../styles';
import {useTranslation} from 'react-i18next';
import {formatDateWithDay} from '../utils';
import HomeItem from '../items/home.item';
import PlansModal from '../modals/plans.modal';
import HabitsModal from '../modals/habits.modal';
import {getTodayPlans} from '../services/plans.service';
import {getTodayHabits} from '../services/habits.service';

const HomeView = () => {
  const plans = useSelector(state => state.plans);
  const habits = useSelector(state => state.habits);
  const settings = useSelector(state => state.settings);
  const {t} = useTranslation();
  const [todayPlans, setTodayPlans] = useState([]);
  const [todayHabits, setTodayHabits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('');

  useEffect(() => {
    const fetchTodayData = async () => {
      const todayPlans = getTodayPlans();
      setTodayPlans(todayPlans);

      const todayHabits = getTodayHabits();
      setTodayHabits(todayHabits);
    };

    fetchTodayData();
  }, [showModal, plans, habits]);

  return (
    <View style={styles.container}>
      {mode === 'plan' && showModal && (
        <PlansModal setShowModal={setShowModal} />
      )}
      {mode === 'habit' && showModal && (
        <HabitsModal setShowModal={setShowModal} />
      )}
      <>
        <View style={styles.header}>
          <Text style={styles.center}>
            {formatDateWithDay(new Date(), settings.language)}
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
          <View style={styles.gap} />
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
      </>
    </View>
  );
};

export default HomeView;
