import React from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch} from 'react-redux';

import {setCurrentItem, setModalName} from '../redux/actions';
import {getItem} from '../storage/services';
import {styles} from '../styles';
import {formatDateWithDay} from '../utils';

const Note = ({id, when, what, name}) => {
  const dispatch = useDispatch();

  async function fetchData() {
    const data = await getItem(name, id);
    dispatch(setCurrentItem(data));
  }

  function handlePress() {
    dispatch(setModalName(name));
    name && fetchData();
  }

  function assignUnit(name) {
    switch (name) {
      case 'weight':
        return 'kg';
      case 'cost':
        return 'zł';
    }
  }

  return (
    <>
      <Pressable
        style={({pressed}) => [styles.note, {opacity: pressed ? 0.8 : 1}]}
        onPress={() => handlePress()}>
        <Text style={styles.when}>{formatDateWithDay(when)}</Text>
        <Text style={styles.what}>
          {what} {assignUnit(name)}
        </Text>
      </Pressable>
    </>
  );
};

export default Note;
