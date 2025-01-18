import React, {useState} from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch} from 'react-redux';
import {setCurrentItem} from '../redux/actions';
import {getHabit} from '../services/habits.service';
import {styles} from '../styles';
import {useTranslation} from 'react-i18next';

const HabitItem = ({
  id,
  what,
  drag,
  isActive,
  setShowModal,
  time,
  monday,
  tuesday,
  wednesday,
  thursday,
  friday,
  saturday,
  sunday,
  daily,
}) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  function handlePress() {
    const data = getHabit(id);
    dispatch(setCurrentItem(data));
    setShowModal(true);
  }

  const dynamicStyle = ({pressed}) => [
    styles.tableItem,
    {opacity: pressed ? 0.8 : 1},
    isActive && styles.listItemActive,
  ];

  return (
    <>
      <Pressable
        style={dynamicStyle}
        onPress={() => handlePress()}
        onLongPress={drag}>
        <Text style={styles.when}>
          {daily ? (
            t('daily') + ' '
          ) : (
            <>
              {monday && t('mon') + ' '}
              {tuesday && t('tue') + ' '}
              {wednesday && t('wed') + ' '}
              {thursday && t('thu') + ' '}
              {friday && t('fri') + ' '}
              {saturday && t('sat') + ' '}
              {sunday && t('sun') + ' '}
            </>
          )}
          {time && `| ${time}`}
        </Text>
        {what && (
          <Text style={styles.what} numberOfLines={1} ellipsizeMode="head">
            {what}
          </Text>
        )}
      </Pressable>
    </>
  );
};

export default HabitItem;
