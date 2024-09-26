import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import Control from '../components/control';
import Table from '../components/table';
import { setCosts, setModalName } from '../redux/actions';
import { getEveryItem } from '../services';
import { styles } from '../styles';

export default function Costs() {
  const costs = useSelector((state) => state.costs);
  const modalName = useSelector((state) => state.modalName);
  const dispatch = useDispatch();
  const [average, setAverage] = useState(0);

  async function fetchData() {
    const data = await getEveryItem('cost');
    dispatch(setCosts(data));
  }

  useEffect(() => {
    fetchData();
  }, [modalName]);

  function handleAdd() {
    dispatch(setModalName('cost'));
  }

  function calcAverageCost(costs) {
    if (!Array.isArray(costs) || costs.length === 0) {
      return 0;
    }
    const total = costs.reduce((sum, item) => sum + item.what, 0);
    let averageCost = total / costs.length;
    averageCost = parseFloat(averageCost.toFixed(2));
    return averageCost;
  }

  useEffect(() => {
    const averageCost = calcAverageCost(costs);
    setAverage(averageCost);
  }, [costs]);

  return (
    <View style={styles.container}>
      {costs && (
        <>
          <View style={styles.info}>
            <Text style={styles.center}>{average} zł / day</Text>
          </View>
          <Table items={costs} name='cost' />
          <View style={styles.controllers}>
            <Control type='add' press={handleAdd} />
          </View>
        </>
      )}
    </View>
  );
}
