import React, {useState, useEffect, useRef} from 'react';
import {TextInput, Modal, View, Text, Pressable} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {TimerPicker} from 'react-native-timer-picker';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from './ControlButton';
import {setCurrentItem, setModalName} from '../redux/actions';
import {addItem, updateItem, deleteItem} from '../storage/services';
import {COLORS, DIMENSIONS, styles} from '../styles';
import {
  formatToFloat,
  convertTimeToObject,
  getMarkedDates,
  renderArrow,
  formatDateWithDay,
  getCurrentTime,
} from '../utils';

const ModalDialog = ({name}) => {
  let items;
  let category;
  if (name === 'weight') {
    items = useSelector(state => state.weights);
  } else if (name === 'cost') {
    items = useSelector(state => state.costs);
  } else if (name === 'hour') {
    items = useSelector(state => state.hours);
  } else if (name === 'plan') {
    items = useSelector(state => state.plans);
  } else if (name === 'task') {
    category = useSelector(state => state.category);
  }

  const dispatch = useDispatch();
  const currentItem = useSelector(state => state.currentItem);

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
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (currentItem) {
      // Set When
      if (name === 'habit' || name === 'task') {
        setWhen(currentItem.when?.toString());
      } else {
        const formattedDate = currentItem.when
          ? new Date(currentItem.when).toISOString().split('T')[0]
          : '';
        setWhen(formattedDate);
      }

      // Set Timer
      if (name === 'hour' || name === 'plan') {
        setTimeStart(currentItem.timeStart);
        if (currentItem.timeStart) {
          setShowStartPicker(true);
        }
        setTimeEnd(currentItem.timeEnd);
        if (currentItem.timeEnd) {
          setShowEndPicker(true);
        }
      }
      // Set What
      setWhat(
        typeof currentItem.what === 'number'
          ? currentItem.what.toFixed(2)
          : currentItem.what,
      );
    } else {
      // Reset
      if (name === 'habit' || name === 'task') {
        setWhen('');
      } else {
        const today = new Date().toISOString().split('T')[0];
        setWhen(today);
      }
      if (name === 'weight' && items.length > 0) {
        setWhat(items[0].what);
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
    addItem(
      name,
      when,
      formatToFloat(what, name),
      timeStart,
      timeEnd,
      category,
    );
    Toast.show({
      type: 'add',
      text1: name,
      topOffset: DIMENSIONS.padding,
      visibilityTime: 1500,
    });
    dispatch(setCurrentItem(null));
    dispatch(setModalName(null));
  }

  function handleUpdate() {
    if (currentItem) {
      updateItem(
        name,
        currentItem.id,
        when,
        formatToFloat(what, name),
        timeStart,
        timeEnd,
        check,
        category,
      );
      Toast.show({
        type: 'update',
        text1: name,
        topOffset: DIMENSIONS.padding,
        visibilityTime: 1500,
      });
    }
    dispatch(setCurrentItem(null));
    dispatch(setModalName(null));
  }

  async function handleDelete() {
    if (currentItem) {
      deleteItem(name, currentItem.id);
      Toast.show({
        type: 'delete',
        text1: name,
        topOffset: DIMENSIONS.padding,
        visibilityTime: 1500,
      });
    }
    dispatch(setCurrentItem(null));
    dispatch(setModalName(null));
  }

  const renderCalendar = data =>
    showCalendar || name === 'plan' ? (
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
    ) : (
      <Pressable
        style={styles.inputContainer}
        onPress={() => setShowCalendar(true)}>
        <Text style={styles.input}>{formatDateWithDay(when)}</Text>
      </Pressable>
    );

  const renderInput = (inputModeType = 'numeric', incrementator) => (
    <View style={styles.inputContainer}>
      {incrementator && (
        <>
          <Pressable
            style={styles.incrementator}
            onPress={() => {
              const increasedValue =
                parseFloat(Number(what)) + parseFloat(incrementator);
              setWhat(increasedValue.toFixed(2));
            }}>
            {renderArrow('up')}
          </Pressable>
        </>
      )}
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={what}
        onChangeText={text => setWhat(text)}
        inputMode={inputModeType}
        placeholder={name === 'task' ? `Enter ${category}` : `Enter ${name}`}
        placeholderTextColor={COLORS.primary}
        maxLength={60}
      />
      {incrementator && (
        <>
          <Pressable
            style={styles.incrementator}
            onPress={() => {
              const decreasedValue =
                parseFloat(Number(what)) - parseFloat(incrementator);
              setWhat(decreasedValue.toFixed(2));
            }}>
            {renderArrow('down')}
          </Pressable>
        </>
      )}
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
            initialValue={
              timeStart
                ? convertTimeToObject(timeStart)
                : convertTimeToObject(getCurrentTime())
            }
            onDurationChange={duration => {
              const hours = duration.hours.toString().padStart(2, '0');
              const minutes = duration.minutes.toString().padStart(2, '0');
              setTimeStart(`${hours}:${minutes}`);
            }}
          />
        </View>
      ) : (
        <Pressable
          style={styles.clockContainer}
          onPress={() => setShowStartPicker(true)}>
          <Text style={styles.setter}>Set start time</Text>
        </Pressable>
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
            initialValue={
              timeEnd
                ? convertTimeToObject(timeEnd)
                : convertTimeToObject(getCurrentTime())
            }
            onDurationChange={duration => {
              const hours = duration.hours.toString().padStart(2, '0');
              const minutes = duration.minutes.toString().padStart(2, '0');
              setTimeEnd(`${hours}:${minutes}`);
            }}
          />
        </View>
      ) : (
        <Pressable
          style={styles.clockContainer}
          onPress={() => setShowEndPicker(true)}>
          <Text style={styles.setter}>Set end time</Text>
        </Pressable>
      )}
    </View>
  );

  const renderDialog = () => {
    switch (name) {
      case 'weight':
        return (
          <>
            {renderCalendar(items)}
            {renderInput('numeric', 0.05)}
          </>
        );
      case 'cost':
        return (
          <>
            {renderCalendar(items)}
            {renderInput('numeric', 1)}
          </>
        );
      case 'hour':
        return (
          <>
            {renderCalendar(items)}
            {renderClock('numeric')}
          </>
        );
      case 'plan':
        return (
          <>
            {renderCalendar(items)}
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
      visible={name !== null}
      onRequestClose={handleClose}>
      <View style={styles.container}>
        {renderDialog()}
        <View style={styles.controllers}>
          <ControlButton type="cancel" press={handleClose} />
          {currentItem !== null ? (
            <>
              <ControlButton type="delete" press={handleDelete} />
              <ControlButton
                type="accept"
                press={handleUpdate}
                disabled={
                  (!what && name !== 'hour') || (name === 'hour' && !timeStart)
                }
              />
            </>
          ) : (
            <ControlButton
              type="accept"
              press={handleAdd}
              disabled={
                (!what && name !== 'hour') || (name === 'hour' && !timeStart)
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ModalDialog;
