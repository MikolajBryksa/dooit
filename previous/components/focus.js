import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';

import Note from './note';
import { getTodaysPlans } from '../services';
import { styles } from '../styles';

export default function Focus({ habit }) {
  const modalName = useSelector((state) => state.modalName);
  const [plans, setPlans] = useState();

  async function fetchData() {
    const data = await getTodaysPlans();
    setPlans(data);
  }

  useEffect(() => {
    fetchData();
  }, [modalName]);

  return (
    <View style={styles.scrollView}>
      {plans &&
        plans.map((item, index) => (
          <Note key={index} id={item.id} when={item.when} what={item.what} name='plan' />
        ))}
      <View style={styles.info}>
        <Text style={styles.center}>{habit.what}</Text>
      </View>
    </View>
  );
}
