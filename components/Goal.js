import React from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch} from 'react-redux';

import {setCurrentItem, setModalName} from '../redux/actions';
import {getItem} from '../storage/services';
import {styles} from '../styles';

const Goal = ({id, when, what, name}) => {
  const dispatch = useDispatch();

  async function fetchData() {
    const data = await getItem(name, id);
    dispatch(setCurrentItem(data));
  }

  function handlePress() {
    dispatch(setModalName(name));
    name && fetchData();
  }

  return (
    <>
      <Pressable
        style={({pressed}) => [styles.goal, {opacity: pressed ? 0.8 : 1}]}
        onPress={() => handlePress()}>
        <Text style={styles.goalWhat}>{what}</Text>
      </Pressable>
    </>
  );
};

export default Goal;
