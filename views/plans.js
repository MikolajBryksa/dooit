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

  async function fetchData() {
    const data = getEveryItem('plan', false);
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

  return (
    <View style={styles.container}>
      {plans && (
        <>
          <View style={styles.info}>
            <Text style={styles.center}>{formatDateWithDay(new Date())}</Text>
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
