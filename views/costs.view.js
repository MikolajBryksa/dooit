import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import {setCosts, setCurrentView} from '../redux/actions';
import {getEveryCost} from '../services/costs.service';
import {styles} from '../styles';
import {convertToISO} from '../utils';
import CostsModal from '../modals/costs.modal';
import CostItem from '../items/cost.item';

const CostsView = () => {
  const costs = useSelector(state => state.costs);
  const currentView = useSelector(state => state.currentView);
  const dispatch = useDispatch();
  const [averageCost, setAverageCost] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const data = getEveryCost();
      const formattedData = data.map(item => ({
        ...item,
        what: item.what.toFixed(2),
        when: convertToISO(new Date(item.when).toLocaleDateString()),
      }));
      dispatch(setCosts(formattedData));
    }
    fetchData();
  }, [currentView]);

  useEffect(() => {
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
      const timeDifference = Math.abs(lastDate - firstDate);
      const days = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
      const averageCost = totalCost / days;
      return averageCost.toFixed(2);
    }
    const averageCost = calcAverageCost(costs);
    setAverageCost(averageCost);
  }, [costs]);

  function handleAdd() {
    dispatch(setCurrentView('costs'));
  }

  return (
    <View style={styles.container}>
      {currentView === 'costs' && <CostsModal />}
      {costs && (
        <>
          {costs.length > 0 && (
            <View style={styles.header}>
              <Text style={styles.center}>{averageCost} zł / day</Text>
            </View>
          )}

          <ScrollView style={styles.scrollView}>
            {costs.map((item, index) => (
              <CostItem
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

export default CostsView;
