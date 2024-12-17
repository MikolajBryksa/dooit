import React from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch} from 'react-redux';
import {setCurrentItem, setCurrentView} from '../redux/actions';
import {getCost} from '../services/costs.service';
import {styles} from '../styles';
import {formatDateWithDay} from '../utils';

const CostItem = ({id, when, what}) => {
  const dispatch = useDispatch();

  async function fetchData() {
    const data = getCost(id);
    dispatch(setCurrentItem(data));
  }

  function handlePress() {
    dispatch(setCurrentView('costs'));
    fetchData();
  }

  const dynamicStyle = ({pressed}) => [
    styles.tableItem,
    {opacity: pressed ? 0.8 : 1},
  ];

  return (
    <Pressable style={dynamicStyle} onPress={handlePress}>
      <Text style={styles.when}>{formatDateWithDay(when)}</Text>
      {what && (
        <Text style={styles.what} numberOfLines={1} ellipsizeMode="head">
          {what} zł
        </Text>
      )}
    </Pressable>
  );
};

export default CostItem;
