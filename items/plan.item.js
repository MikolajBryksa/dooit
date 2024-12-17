import React from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch} from 'react-redux';
import {setCurrentItem, setCurrentView} from '../redux/actions';
import {getPlan} from '../services/plans.service';
import {styles} from '../styles';
import {formatDateWithDay} from '../utils';

const PlanItem = ({id, when, what, time}) => {
  const dispatch = useDispatch();

  async function fetchData() {
    const data = getPlan(id);
    dispatch(setCurrentItem(data));
  }

  function handlePress() {
    dispatch(setCurrentView('plans'));
    fetchData();
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDate = new Date(when) < today;
  const dynamicStyle = ({pressed}) => [
    styles.tableItem,
    {opacity: pressed ? 0.8 : 1},
    isPastDate && {opacity: pressed ? 0.3 : 0.5},
  ];

  return (
    <Pressable style={dynamicStyle} onPress={handlePress}>
      <Text style={styles.when}>
        {formatDateWithDay(when)}
        {time && ` | ${time}`}
      </Text>
      {what && (
        <Text style={styles.what} numberOfLines={1} ellipsizeMode="head">
          {what}
        </Text>
      )}
    </Pressable>
  );
};

export default PlanItem;
