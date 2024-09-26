import React, {useState, useEffect, useRef} from 'react';
import {TextInput, Modal, View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';

import Control from './Control';
import {setCurrentItem, setModalName} from '../redux/actions';
import {addItem, updateItem, deleteItem} from '../services';
import {COLORS, DIMENSIONS, styles} from '../styles';
import {formatToFloat, getMarkedDates} from '../utils';

export default function Dialog() {
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
      setWhen(currentItem.when?.toString());
      setWhat(currentItem.what?.toString());
    } else {
      const today = new Date().toISOString().split('T')[0];
      setWhen(today);
    }
  }, [currentItem]);

  function handleClose() {
    dispatch(setCurrentItem(null));
    dispatch(setModalName(null));
  }

  async function handleDelete() {
    if (currentItem) {
      try {
        const data = await deleteItem(modalName, currentItem.id);
        Toast.show({
          type: 'delete',
          text1: `${data.what}`,
          topOffset: DIMENSIONS.padding,
        });
      } catch (error) {
        console.error('Error deleting item:', error);
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

  async function handleUpdate() {
    if (currentItem) {
      try {
        const data = await updateItem(modalName, currentItem.id, when, what);
        if (currentItem.what !== what) {
          Toast.show({
            type: 'update',
            text1: `${currentItem.what}`,
            text2: `${data.what}`,
            topOffset: DIMENSIONS.padding,
          });
        } else {
          Toast.show({
            type: 'update',
            text1: `${currentItem.when}`,
            text2: `${data.when}`,
            topOffset: DIMENSIONS.padding,
          });
        }
      } catch (error) {
        console.error('Error updating item:', error);
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

  async function handleAdd() {
    try {
      const data = await addItem(modalName, when, what);
      Toast.show({
        type: 'add',
        text1: `${data.what}`,
        topOffset: DIMENSIONS.padding,
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

  function renderArrow(direction) {
    const icon = direction === 'left' ? faChevronLeft : faChevronRight;
    return (
      <FontAwesomeIcon
        icon={icon}
        style={[styles.icon, {color: COLORS.primary}]}
      />
    );
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
      <View style={styles.note}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={what}
          onChangeText={text =>
            setWhat(inputModeType === 'numeric' ? formatToFloat(text) : text)
          }
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
          <View style={styles.note}>
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
          <Control type="cancel" press={handleClose} />
          {currentItem !== null ? (
            <>
              <Control type="delete" press={handleDelete} />
              <Control type="accept" press={handleUpdate} />
            </>
          ) : (
            <Control type="accept" press={handleAdd} />
          )}
        </View>
      </View>
    </Modal>
  );
}
