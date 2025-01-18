import React, {useState, useEffect} from 'react';
import {Modal, View} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import {setCurrentItem} from '../redux/actions';
import {addHabit, updateHabit, deleteHabit} from '../services/habits.service';
import {DIMENSIONS, styles} from '../styles';
import {WhatInput, TimeInput, DaysInput} from '../components/inputs';
import {useTranslation} from 'react-i18next';
import {isDaily} from '../utils';

const HabitsModal = ({setShowModal}) => {
  const currentItem = useSelector(state => state.currentItem);
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const [when, setWhen] = useState('');
  const [what, setWhat] = useState('');
  const [time, setTime] = useState('');
  const [showDaysPicker, setShowDaysPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const defaultDays = {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  };

  const [days, setDays] = useState(defaultDays);

  useEffect(() => {
    if (currentItem) {
      setWhen(currentItem.when?.toString());
      setWhat(currentItem.what);
      setTime(currentItem.time);
      if (currentItem.time) {
        setShowTimePicker(true);
      }
      setDays({
        monday: currentItem.monday,
        tuesday: currentItem.tuesday,
        wednesday: currentItem.wednesday,
        thursday: currentItem.thursday,
        friday: currentItem.friday,
        saturday: currentItem.saturday,
        sunday: currentItem.sunday,
      });
      if (!isDaily(currentItem)) {
        setShowDaysPicker(true);
      }
    } else {
      setWhen('');
      setWhat('');
      setTime('');
      setDays(defaultDays);
    }
  }, [currentItem]);

  function handleClose() {
    dispatch(setCurrentItem(null));
    setShowModal(false);
  }
  function handleAdd() {
    addHabit(when, what, time, days);
    Toast.show({
      type: 'add',
      text1: 'habits',
      topOffset: DIMENSIONS.padding,
      visibilityTime: 1200,
    });
    handleClose();
  }

  function handleUpdate() {
    if (currentItem) {
      updateHabit(currentItem.id, when, what, time, days, currentItem.check);
      Toast.show({
        type: 'update',
        text1: 'habits',
        topOffset: DIMENSIONS.padding,
        visibilityTime: 1200,
      });
    }
    handleClose();
  }

  async function handleDelete() {
    if (currentItem) {
      deleteHabit(currentItem.id);
      Toast.show({
        type: 'delete',
        text1: 'habits',
        topOffset: DIMENSIONS.padding,
        visibilityTime: 1200,
      });
    }
    handleClose();
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.container}>
        <DaysInput
          showDaysPicker={showDaysPicker}
          setShowDaysPicker={setShowDaysPicker}
          days={days}
          setDays={setDays}
          firstDay={settings.firstDay}
          placeholder={t('set-days')}
        />
        <WhatInput
          what={what}
          setWhat={setWhat}
          placeholder={t('enter-habit')}
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

export default HabitsModal;
