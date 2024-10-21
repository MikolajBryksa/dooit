import React, {useState, useEffect, useRef} from 'react';
import {TextInput, Modal, View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';

import ControlButton from './ControlButton';
import {setCurrentItem, setModalName} from '../redux/actions';
import {addItem, updateItem, deleteItem} from '../storage/services';
import {COLORS, DIMENSIONS, styles} from '../styles';
import {
  formatToFloat,
  formatDateWithDay,
  getMarkedDates,
  renderArrow,
} from '../utils';

const ModalDialog = () => {
  const modalName = useSelector(state => state.modalName);
  const currentItem = useSelector(state => state.currentItem);
  const dispatch = useDispatch();
  const weights = useSelector(state => state.weights);
  const costs = useSelector(state => state.costs);
  const plans = useSelector(state => state.plans);

  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  const [when, setWhen] = useState('');
  const [what, setWhat] = useState('');

  useEffect(() => {
    if (currentItem) {
      if (modalName === 'habit' || modalName === 'task') {
        setWhen(currentItem.when?.toString());
      } else {
        const formattedDate = currentItem.when
          ? new Date(currentItem.when).toISOString().split('T')[0]
          : '';
        setWhen(formattedDate);
      }

      setWhat(
        typeof currentItem.what === 'number'
          ? currentItem.what.toFixed(2)
          : currentItem.what,
      );
    } else {
      if (modalName === 'habit' || modalName === 'task') {
        setWhen('');
      } else {
        const today = new Date().toISOString().split('T')[0];
        setWhen(today);
      }
    }
  }, [currentItem]);

  function handleClose() {
    dispatch(setCurrentItem(null));
    dispatch(setModalName(null));
  }

  function handleAdd() {
    try {
      addItem(modalName, when, formatToFloat(what, modalName));
      Toast.show({
        type: 'add',
        text1: `${formatDateWithDay(when)}`,
        text2: `${what}`,
        topOffset: DIMENSIONS.padding,
        visibilityTime: 2500,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: `${error}`,
        topOffset: DIMENSIONS.padding,
      });
    }
    dispatch(setCurrentItem(null));
    dispatch(setModalName(null));
  }

  function handleUpdate() {
    if (currentItem) {
      try {
        updateItem(
          modalName,
          currentItem.id,
          when,
          formatToFloat(what, modalName),
        );
        Toast.show({
          type: 'update',
          text1: `${formatDateWithDay(when)}`,
          text2: `${what}`,
          topOffset: DIMENSIONS.padding,
          visibilityTime: 2500,
        });
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: `${error}`,
          topOffset: DIMENSIONS.padding,
        });
      }
    }
    dispatch(setCurrentItem(null));
    dispatch(setModalName(null));
  }

  async function handleDelete() {
    if (currentItem) {
      try {
        deleteItem(modalName, currentItem.id);
        Toast.show({
          type: 'delete',
          text1: `${formatDateWithDay(when)}`,
          text2: `${what}`,
          topOffset: DIMENSIONS.padding,
          visibilityTime: 2500,
        });
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: `${error}`,
          topOffset: DIMENSIONS.padding,
        });
      }
    }
    dispatch(setCurrentItem(null));
    dispatch(setModalName(null));
  }

  const renderCalendarAndInput = (data, inputModeType = 'numeric') => (
    <>
      <View style={styles.calendar}>
        <Calendar
          onDayPress={day => {
            setWhen(day.dateString);
          }}
          initialDate={when}
          firstDay={1}
          markedDates={getMarkedDates(data, when)}
          renderArrow={renderArrow}
          theme={styles.calendarTheme}
        />
      </View>
      <View style={styles.tableItem}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={what}
          onChangeText={text => setWhat(text)}
          inputMode={inputModeType}
          placeholder={`Enter ${modalName}`}
          placeholderTextColor={COLORS.primary}
        />
      </View>
    </>
  );

  const renderInputs = () => {
    switch (modalName) {
      case 'weight':
        return renderCalendarAndInput(weights, 'numeric');
      case 'cost':
        return renderCalendarAndInput(costs, 'numeric');
      case 'plan':
        return renderCalendarAndInput(plans, 'text');
      case 'habit':
      case 'task':
        return (
          <View style={styles.tableItem}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={what}
              onChangeText={text => setWhat(text)}
              inputMode="text"
              placeholder={`Enter ${modalName}`}
              placeholderTextColor={COLORS.primary}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={modalName !== null}
      onRequestClose={handleClose}>
      <View style={styles.container}>
        {renderInputs()}
        <View style={styles.controllers}>
          <ControlButton type="cancel" press={handleClose} />
          {currentItem !== null ? (
            <>
              <ControlButton type="delete" press={handleDelete} />
              <ControlButton type="accept" press={handleUpdate} />
            </>
          ) : (
            <ControlButton type="accept" press={handleAdd} />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ModalDialog;
