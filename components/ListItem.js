import React from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch} from 'react-redux';

import {setCurrentItem, setModalName} from '../redux/actions';
import {getItem} from '../storage/services';
import {styles} from '../styles';

const ListItem = ({id, what, name, drag, isActive}) => {
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
        style={({pressed}) => [
          styles.listItem,
          {opacity: pressed ? 0.8 : 1},
          isActive && styles.listItemActive,
        ]}
        onPress={() => handlePress()}
        onLongPress={drag}>
        <Text style={styles.listItemWhat}>{what}</Text>
      </Pressable>
    </>
  );
};

export default ListItem;
