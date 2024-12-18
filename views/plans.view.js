import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import PlanItem from '../items/plan.item';
import {setPlans} from '../redux/actions';
import {getEveryPlan} from '../services/plans.service';
import {styles} from '../styles';
import {formatDateWithDay} from '../utils';
import {convertToISO} from '../utils';
import PlansModal from '../modals/plans.modal';

const PlansView = () => {
  const plans = useSelector(state => state.plans);
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const data = getEveryPlan(settings.rowsNumber);
      const formattedData = data.map(item => ({
        ...item,
        what: item.what,
        when: convertToISO(new Date(item.when).toLocaleDateString()),
      }));
      dispatch(setPlans(formattedData));
    }
    fetchData();
  }, [showModal, settings.rowsNumber]);

  function handleAdd() {
    setShowModal(true);
  }

  return (
    <View style={styles.container}>
      {showModal && <PlansModal setShowModal={setShowModal} />}
      {plans && (
        <>
          <View style={styles.header}>
            <Text style={styles.center}>
              {formatDateWithDay(new Date(), settings.language)}
            </Text>
          </View>

          <ScrollView style={styles.scrollView}>
            {plans.map((item, index) => (
              <PlanItem
                key={index}
                id={item.id}
                when={item.when}
                what={item.what}
                time={item.time}
                setShowModal={setShowModal}
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
