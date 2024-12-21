import React, {useState, useEffect} from 'react';
import {Modal, View} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import {setCurrentItem} from '../redux/actions';
import {addPlan, updatePlan, deletePlan} from '../services/plans.service';
import {DIMENSIONS, styles} from '../styles';
import {WhenInput, WhatInput, TimeInput} from '../components/inputs';
import {useTranslation} from 'react-i18next';

const PlansModal = ({setShowModal}) => {
  const plans = useSelector(state => state.plans);
  const currentItem = useSelector(state => state.currentItem);
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const [when, setWhen] = useState('');
  const [what, setWhat] = useState('');
  const [time, setTime] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (currentItem) {
      const date = new Date(currentItem.when).toISOString().split('T')[0];
      setWhen(date);
      setWhat(currentItem.what);
      setTime(currentItem.time);
      if (currentItem.time) {
        setShowTimePicker(true);
      }
    } else {
      const today = new Date().toISOString().split('T')[0];
      setWhen(today);
      setWhat('');
      setTime('');
    }
  }, [currentItem]);

  function handleClose() {
    dispatch(setCurrentItem(null));
    setShowModal(false);
  }

  function handleAdd() {
    addPlan(when, what, time);
    Toast.show({
      type: 'add',
      text1: 'plans',
      topOffset: DIMENSIONS.padding,
      visibilityTime: 1200,
    });
    handleClose();
  }

  function handleUpdate() {
    if (currentItem) {
      updatePlan(currentItem.id, when, what, time);
      Toast.show({
        type: 'update',
        text1: 'plans',
        topOffset: DIMENSIONS.padding,
        visibilityTime: 1200,
      });
    }
    handleClose();
  }

  async function handleDelete() {
    if (currentItem) {
      deletePlan(currentItem.id);
      Toast.show({
        type: 'delete',
        text1: 'plans',
        topOffset: DIMENSIONS.padding,
        visibilityTime: 1200,
      });
    }
    handleClose();
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.container}>
        <WhenInput
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          when={when}
          setWhen={setWhen}
          data={plans}
          firstDay={settings.firstDay}
          language={settings.language}
        />
        <WhatInput
          what={what}
          setWhat={setWhat}
          placeholder={t('enter-plan')}
          inputModeType="text"
        />
        <TimeInput
          time={time}
          setTime={setTime}
          showTimePicker={showTimePicker}
          setShowTimePicker={setShowTimePicker}
          clockFormat={settings.clockFormat}
          placeholder={t('set-time')}
        />
        <View style={styles.controllers}>
          <ControlButton type="cancel" press={handleClose} />
          {currentItem !== null ? (
            <>
              <ControlButton type="delete" press={handleDelete} />
              <ControlButton
                type="accept"
                press={handleUpdate}
                disabled={!what}
              />
            </>
          ) : (
            <ControlButton type="accept" press={handleAdd} disabled={!what} />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PlansModal;
