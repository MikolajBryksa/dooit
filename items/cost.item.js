import React from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch} from 'react-redux';
import {setCurrentItem} from '../redux/actions';
import {getCost} from '../services/costs.service';
import {styles} from '../styles';
import {formatDateWithDay} from '../utils';

const CostItem = ({id, when, what, setShowModal}) => {
  const dispatch = useDispatch();

  function handlePress() {
    const data = getCost(id);
    dispatch(setCurrentItem(data));
    setShowModal(true);
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
