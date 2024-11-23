import React from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch} from 'react-redux';

import {setCurrentItem, setModalName} from '../redux/actions';
import {getItem} from '../storage/services';
import {styles} from '../styles';
import {formatDateWithDay} from '../utils';

const TableItem = ({id, when, what, name, timeStart, timeEnd}) => {
  const dispatch = useDispatch();

  async function fetchData() {
    const data = await getItem(name, id);
    dispatch(setCurrentItem(data));
  }

  function handlePress() {
    dispatch(setModalName(name));
    name && fetchData();
  }

  function assignUnit() {
    switch (name) {
      case 'weight':
        return 'kg';
      case 'cost':
        return 'zł';
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDate = new Date(when) < today;
  const dynamicStyle = ({pressed}) => [
    styles.tableItem,
    {opacity: pressed ? 0.8 : 1},
    name === 'plan' && isPastDate && {opacity: pressed ? 0.3 : 0.5},
  ];

  return (
    <>
      <Pressable style={dynamicStyle} onPress={() => handlePress()}>
        <Text style={styles.when}>
          {formatDateWithDay(when)}
          {timeStart && ` | ${timeStart}`}
          {timeEnd && ` - ${timeEnd}`}
        </Text>
        <Text style={styles.what}>
          {what} {assignUnit(name)}
        </Text>
      </Pressable>
    </>
  );
};

export default TableItem;
