import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import Control from '../components/control';
import Table from '../components/table';
import { setPlans, setModalName } from '../redux/actions';
import { getEveryItem } from '../services';
import { styles } from '../styles';

export default function Plans() {
  const plans = useSelector((state) => state.plans);
  const modalName = useSelector((state) => state.modalName);
  const dispatch = useDispatch();

  async function fetchData() {
    const data = await getEveryItem('plan');
    dispatch(setPlans(data));
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
          <Table items={plans} name='plan' />
          <View style={styles.controllers}>
            <Control type='add' press={handleAdd} />
          </View>
        </>
      )}
    </View>
  );
}
