import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Control from '../components/Control';
import Table from '../components/Table';
import {setWeights, setModalName} from '../redux/actions';
import {getEveryItem} from '../storage/services';
import {styles} from '../styles';
import {convertToISO} from '../utils';

const Weights = () => {
  const weights = useSelector(state => state.weights);
  const modalName = useSelector(state => state.modalName);
  const dispatch = useDispatch();
  const [weightChange, setWeightChange] = useState(0);
  const [dayDifference, setDayDifference] = useState(0);

  async function fetchData() {
    const data = getEveryItem('weight', true);
    const formattedData = data.map(item => ({
      ...item,
      what: item.what.toFixed(2),
      when: convertToISO(new Date(item.when).toLocaleDateString()),
    }));
    dispatch(setWeights(formattedData));
  }

  useEffect(() => {
    fetchData();
  }, [modalName]);

  function handleAdd() {
    dispatch(setModalName('weight'));
  }

  function calcWeightChange(weights) {
    if (!Array.isArray(weights) || weights.length === 0) {
      return 0;
    }

    const firstWeight = weights[0].what;
    const lastWeight = weights[weights.length - 1].what;
    let weightChange = firstWeight - lastWeight;
    weightChange = parseFloat(weightChange.toFixed(2));

    const firstDate = new Date(weights[0].when);
    const lastDate = new Date(weights[weights.length - 1].when);
    const timeDifference = Math.abs(lastDate - firstDate);
    const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return {weightChange, dayDifference};
  }

  useEffect(() => {
    const {weightChange, dayDifference} = calcWeightChange(weights);
    setWeightChange(weightChange);
    setDayDifference(dayDifference);
  }, [weights]);

  return (
    <View style={styles.container}>
      {weights && (
        <>
          <View style={styles.info}>
            <Text style={styles.center}>
              {weightChange} kg / {dayDifference} days
            </Text>
          </View>
          <Table items={weights} name="weight" />
          <View style={styles.controllers}>
            <Control type="add" press={handleAdd} />
          </View>
        </>
      )}
    </View>
  );
};

export default Weights;
