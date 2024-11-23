import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import ControlButton from '../components/ControlButton';
import Table from '../components/Table';
import {setCosts, setModalName} from '../redux/actions';
import {getEveryItem} from '../storage/services';
import {styles} from '../styles';
import {convertToISO} from '../utils';

const Costs = () => {
  const costs = useSelector(state => state.costs);
  const modalName = useSelector(state => state.modalName);
  const dispatch = useDispatch();
  const [averageCost, setAverageCost] = useState(0);

  async function fetchData() {
    const data = getEveryItem('cost', true);
    const formattedData = data.map(item => ({
      ...item,
      what: item.what.toFixed(2),
      when: convertToISO(new Date(item.when).toLocaleDateString()),
    }));
    dispatch(setCosts(formattedData));
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
    const totalCost = costs.reduce(
      (sum, cost) => sum + parseFloat(cost.what),
      0,
    );

    const firstDate = new Date();
    const lastDate = new Date(costs[costs.length - 1].when);
    console.log(firstDate, lastDate);
    const timeDifference = Math.abs(lastDate - firstDate);
    const days = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    const averageCost = totalCost / (days + 1);
    return averageCost.toFixed(2);
  }

  useEffect(() => {
    const averageCost = calcAverageCost(costs);
    setAverageCost(averageCost);
  }, [costs]);

  return (
    <View style={styles.container}>
      {costs && (
        <>
          <View style={styles.info}>
            <Text style={styles.center}>{averageCost} zł / day</Text>
          </View>
          <Table items={costs} name="cost" />
          <View style={styles.controllers}>
            <ControlButton type="add" press={handleAdd} />
          </View>
        </>
      )}
    </View>
  );
};

export default Costs;
