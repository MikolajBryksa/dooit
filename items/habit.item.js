import React, {useState} from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch} from 'react-redux';
import {setCurrentItem} from '../redux/actions';
import {getHabit} from '../services/habits.service';
import {styles} from '../styles';

const HabitItem = ({id, what, drag, isActive, setShowModal}) => {
  const dispatch = useDispatch();

  function handlePress() {
    const data = getHabit(id);
    dispatch(setCurrentItem(data));
    setShowModal(true);
  }

  const dynamicStyle = ({pressed}) => [
    styles.listItem,
    {opacity: pressed ? 0.8 : 1},
    isActive && styles.listItemActive,
  ];

  return (
    <>
      <Pressable
        style={dynamicStyle}
        onPress={() => handlePress()}
        onLongPress={drag}>
        <Text
          style={styles.listItemWhat}
          numberOfLines={1}
          ellipsizeMode="tail">
          {what}
        </Text>
      </Pressable>
    </>
  );
};

export default HabitItem;
