import React from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setCurrentItem} from '../redux/actions';
import {getBudget} from '../services/budgets.service';
import {COLORS, styles} from '../styles';

const BudgetItem = ({id, type, period, name, what, setShowModal}) => {
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();

  function handlePress() {
    const data = getBudget(id);
    dispatch(setCurrentItem(data));
    setShowModal(true);
  }

  const dynamicStyle = ({pressed}) => [
    styles.tableItem,
    {opacity: pressed ? 0.8 : 1},
  ];

  const textStyle = [
    styles.what,
    {color: type === 'income' ? COLORS.secondary : COLORS.text},
  ];

  return (
    <Pressable style={dynamicStyle} onPress={handlePress}>
      <Text style={styles.when}>{name}</Text>
      {what && (
        <Text style={textStyle} numberOfLines={1} ellipsizeMode="head">
          {period === 'yearly' ? (what / 12).toFixed(2) : what}{' '}
          {settings.currency}
        </Text>
      )}
    </Pressable>
  );
};

export default BudgetItem;
