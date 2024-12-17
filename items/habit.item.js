import React, {useState} from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setCurrentItem, setCurrentView, setTasks} from '../redux/actions';
import {getHabit} from '../services/habits.service';
import {styles} from '../styles';

const HabitItem = ({id, what, drag, isActive}) => {
  const dispatch = useDispatch();

  function handlePress() {
    dispatch(setCurrentView('habits'));
    const data = getHabit(id);
    dispatch(setCurrentItem(data));
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
