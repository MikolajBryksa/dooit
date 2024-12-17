import React, {useState, useEffect, useRef} from 'react';
import {Modal, View, Pressable, Text} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import {setCurrentItem, setCurrentView} from '../redux/actions';
import {addPlan, updatePlan, deletePlan} from '../services/plans.service';
import {DIMENSIONS, styles} from '../styles';
import {WhenInput, WhatInput, TimeInput} from '../components/inputs';

const PlansModal = () => {
  const plans = useSelector(state => state.plans);
  const currentItem = useSelector(state => state.currentItem);
  const dispatch = useDispatch();

  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  const [when, setWhen] = useState('');
  const [what, setWhat] = useState('');
  const [time, setTime] = useState('');
  const [showCalendar, setShowCalendar] = useState(true);
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
    dispatch(setCurrentView(null));
  }

  function handleAdd() {
    addPlan(when, what, time);
    Toast.show({
      type: 'add',
      text1: 'plans',
      topOffset: DIMENSIONS.padding,
      visibilityTime: 1500,
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
        visibilityTime: 1500,
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
        visibilityTime: 1500,
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
        />
        <WhatInput
          inputRef={inputRef}
          what={what}
          setWhat={setWhat}
          placeholder="Enter plan"
          inputModeType="text"
        />
        <TimeInput
          time={time}
          setTime={setTime}
          showTimePicker={showTimePicker}
          setShowTimePicker={setShowTimePicker}
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
