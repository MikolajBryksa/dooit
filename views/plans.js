import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import ControlButton from '../components/ControlButton';
import Table from '../components/Table';
import {setPlans, setModalName} from '../redux/actions';
import {getEveryItem} from '../storage/services';
import {styles} from '../styles';
import {formatDateWithDay} from '../utils';
import {convertToISO} from '../utils';

const Plans = () => {
  const plans = useSelector(state => state.plans);
  const modalName = useSelector(state => state.modalName);
  const dispatch = useDispatch();
  const [freeDay, setFreeDay] = useState('');

  async function fetchData() {
    const data = getEveryItem('plan', true);
    const formattedData = data.map(item => ({
      ...item,
      what: item.what,
      when: convertToISO(new Date(item.when).toLocaleDateString()),
    }));
    dispatch(setPlans(formattedData));
  }

  useEffect(() => {
    fetchData();
  }, [modalName]);

  function handleAdd() {
    dispatch(setModalName('plan'));
  }

  function findFreeDay(plans) {
    if (!Array.isArray(plans) || plans.length === 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return formatDateWithDay(tomorrow);
    }

    const occupiedDates = new Set(plans.map(plan => plan.when.split('T')[0]));
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);

    while (true) {
      const dateString = currentDate.toISOString().split('T')[0];
      if (!occupiedDates.has(dateString)) {
        return formatDateWithDay(currentDate);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  useEffect(() => {
    setFreeDay(findFreeDay(plans));
  }, [plans]);

  return (
    <View style={styles.container}>
      {plans && (
        <>
          <View style={styles.info}>
            <Text style={styles.center}>Next free day: {freeDay}</Text>
          </View>
          <Table items={plans} name="plan" />
          <View style={styles.controllers}>
            <ControlButton type="add" press={handleAdd} />
          </View>
        </>
      )}
    </View>
  );
};

export default Plans;
