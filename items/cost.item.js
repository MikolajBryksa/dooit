import React from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setCurrentItem} from '../redux/actions';
import {getCost} from '../services/costs.service';
import {styles} from '../styles';
import {formatDateWithDay} from '../utils';

const CostItem = ({id, when, name, what, setShowModal}) => {
  const settings = useSelector(state => state.settings);
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
      <Text style={styles.when}>
        {formatDateWithDay(when, settings.language)}
        {name && ` | ${name}`}
      </Text>
      {what && (
        <Text style={styles.what} numberOfLines={1} ellipsizeMode="head">
          {what} {settings.currency}
        </Text>
      )}
    </Pressable>
  );
};

export default CostItem;
