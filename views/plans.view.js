import React, {useEffect} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import PlanItem from '../items/plan.item';
import {setPlans, setCurrentView} from '../redux/actions';
import {getEveryPlan} from '../services/plans.service';
import {styles} from '../styles';
import {formatDateWithDay} from '../utils';
import {convertToISO} from '../utils';
import PlansModal from '../modals/plans.modal';

const PlansView = () => {
  const plans = useSelector(state => state.plans);
  const currentView = useSelector(state => state.currentView);
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      const data = getEveryPlan();
      const formattedData = data.map(item => ({
        ...item,
        what: item.what,
        when: convertToISO(new Date(item.when).toLocaleDateString()),
      }));
      dispatch(setPlans(formattedData));
    }
    fetchData();
  }, [currentView]);

  function handleAdd() {
    dispatch(setCurrentView('plans'));
  }

  return (
    <View style={styles.container}>
      {currentView === 'plans' && <PlansModal />}
      {plans && (
        <>
          <View style={styles.header}>
            <Text style={styles.center}>{formatDateWithDay(new Date())}</Text>
          </View>

          <ScrollView style={styles.scrollView}>
            {plans.map((item, index) => (
              <PlanItem
                key={index}
                id={item.id}
                when={item.when}
                what={item.what}
                time={item.time}
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

export default PlansView;
