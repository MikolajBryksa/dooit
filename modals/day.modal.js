import React from 'react';
import {Modal, View, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import HeaderButton from '../components/header.button';
import {styles} from '../styles';
import {useTranslation} from 'react-i18next';
import {updateTempValue} from '../services/temp.service';
import {setSelectedDay} from '../redux/actions';
import {formatDate} from '../utils';
import {resetHabitsCheck} from '../services/habits.service';

const DayModal = ({setShowModal}) => {
  const selectedDay = useSelector(state => state.selectedDay);
  const dispatch = useDispatch();
  const {t} = useTranslation();

  function handleClose() {
    setShowModal(false);
  }

  function handleFinishDay() {
    const nextDay = new Date(selectedDay);
    nextDay.setDate(nextDay.getDate() + 1);
    const formattedDay = formatDate(nextDay);
    resetHabitsCheck();
    updateTempValue('selectedDay', formattedDay);
    dispatch(setSelectedDay(formattedDay));
    handleClose();
  }

  function handleRevokeDay() {
    const previousDay = new Date(selectedDay);
    previousDay.setDate(previousDay.getDate() - 1);
    const formattedDay = formatDate(previousDay);
    resetHabitsCheck();
    updateTempValue('selectedDay', formattedDay);
    dispatch(setSelectedDay(formattedDay));
    handleClose();
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <HeaderButton name={t('finish-day')} active={true} />
        </View>
        <View style={styles.controllers}>
          <ControlButton type="cancel" press={handleClose} />
          <ControlButton type="back" press={handleRevokeDay} />
          <ControlButton type="accept" press={handleFinishDay} />
        </View>
      </View>
    </Modal>
  );
};

export default DayModal;
