import React from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setCurrentItem, setCurrentView} from '../redux/actions';
import {getPlan} from '../services/plans.service';
import {styles} from '../styles';
import {formatDateWithDay} from '../utils';
import {convertTo12HourFormat} from '../utils';

const PlanItem = ({id, when, what, time, setShowModal}) => {
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();

  function handlePress() {
    const data = getPlan(id);
    dispatch(setCurrentItem(data));
    setShowModal(true);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDate = new Date(when) < today;
  const dynamicStyle = ({pressed}) => [
    styles.tableItem,
    {opacity: pressed ? 0.8 : 1},
    isPastDate && {opacity: pressed ? 0.2 : 0.3},
  ];

  if (time && settings.clockFormat === '12h') {
    time = convertTo12HourFormat(time);
  }

  return (
    <Pressable style={dynamicStyle} onPress={handlePress}>
      <Text style={styles.when}>
        {formatDateWithDay(when, settings.language)}
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
