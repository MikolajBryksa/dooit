import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/ControlButton';
import Table from '../components/Table';
import {setHours, setModalName} from '../redux/actions';
import {getEveryItem} from '../storage/services';
import {styles} from '../styles';
import {convertToISO} from '../utils';
import {timeToMinutes} from '../utils';

const Hours = () => {
  const hours = useSelector(state => state.hours);
  const modalName = useSelector(state => state.modalName);
  const dispatch = useDispatch();
  const [averageWorkTime, setAverageWorkTime] = useState(0);

  // Data

  async function fetchData() {
    const data = getEveryItem('hour', true);
    const formattedData = data.map(item => ({
      ...item,
      when: convertToISO(new Date(item.when).toLocaleDateString()),
    }));
    dispatch(setHours(formattedData));
  }

  useEffect(() => {
    fetchData();
  }, [modalName]);

  function handleAdd() {
    dispatch(setModalName('hour'));
  }

  // Header

  function calcAverageWorkTime(hours) {
    if (!Array.isArray(hours) || hours.length === 0) {
      return 0;
    }

    if (!hours[0].what) {
      return '00:00';
    } else {
      const validHours = hours.filter(hour => hour.what);
      const totalMinutes = validHours.reduce((sum, hour) => {
        return sum + timeToMinutes(hour.what);
      }, 0);

      const averageWorkTimeMinutes = totalMinutes / validHours.length;
      const averageHours = Math.floor(averageWorkTimeMinutes / 60);
      const averageMinutes = Math.ceil(averageWorkTimeMinutes % 60);

      return `${averageHours.toString().padStart(2, '0')}:${averageMinutes
        .toString()
        .padStart(2, '0')}`;
    }
  }

  useEffect(() => {
    const averageWorkTime = calcAverageWorkTime(hours);
    setAverageWorkTime(averageWorkTime);
  }, [hours]);

  // View

  return (
    <View style={styles.container}>
      {hours && (
        <>
          {hours.length > 0 && hours[0].what && (
            <View style={styles.header}>
              <Text style={styles.center}>{averageWorkTime} h / day</Text>
            </View>
          )}

          <Table items={hours} name="hour" />
          <View style={styles.controllers}>
            <ControlButton type="add" press={handleAdd} />
          </View>
        </>
      )}
    </View>
  );
};

export default Hours;
