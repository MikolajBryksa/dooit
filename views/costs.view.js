import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import {setCosts} from '../redux/actions';
import {getEveryCost} from '../services/costs.service';
import {styles} from '../styles';
import {convertToISO} from '../utils';
import CostsModal from '../modals/costs.modal';
import CostItem from '../items/cost.item';
import {useTranslation} from 'react-i18next';

const CostsView = () => {
  const costs = useSelector(state => state.costs);
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [budgetMode, setBudgetMode] = useState(false);
  const [averageCost, setAverageCost] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const data = getEveryCost(settings.rowsNumber);
      const formattedData = data.map(item => ({
        ...item,
        what: item.what.toFixed(2),
        when: convertToISO(new Date(item.when).toLocaleDateString()),
      }));
      dispatch(setCosts(formattedData));
    }
    fetchData();
  }, [showModal, budgetMode, settings.rowsNumber]);

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
    setShowModal(true);
  }

  function handleMode() {
    if (budgetMode) {
      setBudgetMode(false);
    } else {
      setBudgetMode(true);
    }
  }

  return (
    <View style={styles.container}>
      {!budgetMode && showModal && <CostsModal setShowModal={setShowModal} />}
      {budgetMode && showModal && <CostsModal setShowModal={setShowModal} />}

      {!budgetMode && costs && (
        <>
          <View style={styles.header}>
            <Text style={styles.center}>
              {costs.length > 0
                ? `${averageCost} ${settings.currency} / ${t('day')}`
                : t('no-costs')}
            </Text>
          </View>

          <ScrollView style={styles.scrollView}>
            {costs.map((item, index) => (
              <CostItem
                key={index}
                id={item.id}
                when={item.when}
                what={item.what}
                setShowModal={setShowModal}
              />
            ))}
          </ScrollView>
        </>
      )}

      {budgetMode && costs && (
        <>
          <View style={styles.header}>
            <Text style={styles.center}></Text>
          </View>

          <ScrollView style={styles.scrollView}></ScrollView>
        </>
      )}

      <View style={styles.controllers}>
        {!budgetMode && <ControlButton type="budget" press={handleMode} />}
        {budgetMode && <ControlButton type="back" press={handleMode} />}
        <ControlButton type="add" press={handleAdd} />
      </View>
    </View>
  );
};

export default CostsView;
