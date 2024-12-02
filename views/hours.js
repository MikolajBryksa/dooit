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
  const [averageWorkTime, setAverageWorkTime] = useState('00:00');

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
      return '00:00';
    }

    const groupedByDate = hours.reduce((acc, hour) => {
      const date = new Date(hour.when).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(hour);
      return acc;
    }, {});

    const totalMinutesByDate = Object.values(groupedByDate).map(
      hoursForDate => {
        return hoursForDate.reduce((sum, hour) => {
          if (hour.what) {
            return sum + timeToMinutes(hour.what);
          }
          return sum;
        }, 0);
      },
    );

    const totalMinutes = totalMinutesByDate.reduce(
      (sum, minutes) => sum + minutes,
      0,
    );
    const numberOfDays = totalMinutesByDate.length;

    const averageWorkTimeMinutes = totalMinutes / numberOfDays;
    const averageHours = Math.floor(averageWorkTimeMinutes / 60);
    const averageMinutes = Math.ceil(averageWorkTimeMinutes % 60);

    return `${averageHours.toString().padStart(2, '0')}:${averageMinutes
      .toString()
      .padStart(2, '0')}`;
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
          {hours.length > 0 && (
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
