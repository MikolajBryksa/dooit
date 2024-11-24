import React, {useState, useEffect, useRef} from 'react';
import {TextInput, Modal, View, Text, TouchableOpacity} from 'react-native';
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
  convertTimeToObject,
  getMarkedDates,
  renderArrow,
} from '../utils';
import {TimerPicker} from 'react-native-timer-picker';

const ModalDialog = () => {
  const modalName = useSelector(state => state.modalName);
  const currentItem = useSelector(state => state.currentItem);
  const dispatch = useDispatch();
  const weights = useSelector(state => state.weights);
  const costs = useSelector(state => state.costs);
  const hours = useSelector(state => state.hours);
  const plans = useSelector(state => state.plans);

  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  const [when, setWhen] = useState('');
  const [what, setWhat] = useState('');

  const [timeStart, setTimeStart] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);

  const [timeEnd, setTimeEnd] = useState('');
  const [showEndPicker, setShowEndPicker] = useState(false);

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

      if (modalName === 'hour' || modalName === 'plan') {
        setTimeStart(currentItem.timeStart);
        if (currentItem.timeStart) {
          setShowStartPicker(true);
        }
        setTimeEnd(currentItem.timeEnd);
        if (currentItem.timeEnd) {
          setShowEndPicker(true);
        }
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
      setTimeStart('');
      setTimeEnd('');
    }
  }, [currentItem]);

  function handleClose() {
    dispatch(setCurrentItem(null));
    dispatch(setModalName(null));
  }

  function handleAdd() {
    try {
      addItem(
        modalName,
        when,
        formatToFloat(what, modalName),
        timeStart,
        timeEnd,
      );
      Toast.show({
        type: 'add',
        text1: `${formatDateWithDay(when)}${
          timeStart ? ` | ${timeStart}` : ''
        }${timeEnd ? ` - ${timeEnd}` : ''}`,
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
          timeStart,
          timeEnd,
        );
        Toast.show({
          type: 'update',
          text1: `${formatDateWithDay(when)}${
            timeStart ? ` | ${timeStart}` : ''
          }${timeEnd ? ` - ${timeEnd}` : ''}`,
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
          text1: `${formatDateWithDay(when)}${
            timeStart ? ` | ${timeStart}` : ''
          }${timeEnd ? ` - ${timeEnd}` : ''}`,
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

  const renderCalendar = data => (
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
        hideExtraDays={true}
      />
    </View>
  );

  const renderInput = (inputModeType = 'numeric') => (
    <View style={styles.inputContainer}>
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
  );

  const renderClock = () => (
    <View style={styles.timer}>
      {showStartPicker ? (
        <View style={styles.clockContainer}>
          <TimerPicker
            padWithNItems={0}
            hideSeconds={true}
            hourLabel=":"
            minuteLabel={false}
            styles={styles.clock}
            padHoursWithZero={true}
            initialValue={convertTimeToObject(timeStart)}
            onDurationChange={duration => {
              const hours = duration.hours.toString().padStart(2, '0');
              const minutes = duration.minutes.toString().padStart(2, '0');
              setTimeStart(`${hours}:${minutes}`);
            }}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.clockContainer}
          onPress={() => setShowStartPicker(true)}>
          <Text style={styles.setter}>Set start time</Text>
        </TouchableOpacity>
      )}

      {showEndPicker ? (
        <View style={styles.clockContainer}>
          <TimerPicker
            padWithNItems={0}
            hideSeconds={true}
            hourLabel=":"
            minuteLabel={false}
            styles={styles.clock}
            padHoursWithZero={true}
            initialValue={convertTimeToObject(timeEnd)}
            onDurationChange={duration => {
              const hours = duration.hours.toString().padStart(2, '0');
              const minutes = duration.minutes.toString().padStart(2, '0');
              setTimeEnd(`${hours}:${minutes}`);
            }}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.clockContainer}
          onPress={() => setShowEndPicker(true)}>
          <Text style={styles.setter}>Set end time</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDialog = () => {
    switch (modalName) {
      case 'weight':
        return (
          <>
            {renderCalendar(weights)}
            {renderInput('numeric')}
          </>
        );
      case 'cost':
        return (
          <>
            {renderCalendar(costs)}
            {renderInput('numeric')}
          </>
        );
      case 'hour':
        return (
          <>
            {renderCalendar(hours)}
            {renderClock('numeric')}
          </>
        );
      case 'plan':
        return (
          <>
            {renderCalendar(plans)}
            {renderInput('text')}
            {renderClock('numeric')}
          </>
        );
      case 'habit':
      case 'task':
        return <>{renderInput('text')}</>;
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
        {renderDialog()}
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
