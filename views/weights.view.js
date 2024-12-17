import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import {setWeights, setCurrentView} from '../redux/actions';
import {getEveryWeight} from '../services/weights.service';
import {styles} from '../styles';
import {convertToISO} from '../utils';
import WeightsModal from '../modals/weights.modal';
import WeightItem from '../items/weight.item';

const WeightsView = () => {
  const weights = useSelector(state => state.weights);
  const currentView = useSelector(state => state.currentView);
  const dispatch = useDispatch();
  const [weightChange, setWeightChange] = useState(0);
  const [dayDifference, setDayDifference] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const data = getEveryWeight();
      const formattedData = data.map(item => ({
        ...item,
        what: item.what.toFixed(2),
        when: convertToISO(new Date(item.when).toLocaleDateString()),
      }));
      dispatch(setWeights(formattedData));
    }
    fetchData();
  }, [currentView]);

  useEffect(() => {
    function calcWeightChange(weights) {
      if (!Array.isArray(weights) || weights.length === 0) {
        return 0;
      }

      const firstWeight = weights[0].what;
      const lastWeight = weights[weights.length - 1].what;
      let weightChange = firstWeight - lastWeight;
      weightChange = parseFloat(weightChange.toFixed(2));

      if (weightChange > 0) {
        weightChange = `+${weightChange}`;
      }

      const firstDate = new Date(weights[0].when);
      const lastDate = new Date(weights[weights.length - 1].when);
      const timeDifference = Math.abs(lastDate - firstDate);
      const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

      return {weightChange, dayDifference};
    }
    const {weightChange, dayDifference} = calcWeightChange(weights);
    setWeightChange(weightChange);
    setDayDifference(dayDifference);
  }, [weights]);

  function handleAdd() {
    dispatch(setCurrentView('weights'));
  }

  return (
    <View style={styles.container}>
      {currentView === 'weights' && <WeightsModal />}
      {weights && (
        <>
          {weights.length > 0 && (
            <View style={styles.header}>
              <Text style={styles.center}>
                {weightChange} kg / {dayDifference} days
              </Text>
            </View>
          )}

          <ScrollView style={styles.scrollView}>
            {weights.map((item, index) => (
              <WeightItem
                key={index}
                id={item.id}
                when={item.when}
                what={item.what}
              />
            ))}
          </ScrollView>

          <View style={styles.controllers}>
            <ControlButton type="add" press={handleAdd} />
          </View>
        </>
      )}
    </View>
  );
};

export default WeightsView;
