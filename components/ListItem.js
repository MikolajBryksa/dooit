import React, {useState} from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setCurrentItem, setModalName, setTasks} from '../redux/actions';
import {getItem} from '../storage/services';
import {styles} from '../styles';
import {renderCheck} from '../utils';
import {updateItem} from '../storage/services';

const ListItem = ({
  id,
  what,
  name,
  drag,
  isActive,
  check: initialCheck,
  category,
}) => {
  const dispatch = useDispatch();

  let tasks;
  if (name === 'task') {
    tasks = useSelector(state => state.tasks);
  }
  const [check, setCheck] = useState(initialCheck);

  const toggleCheck = async () => {
    const newCheck = !check;
    setCheck(newCheck);
    updateItem(
      name,
      id,
      id, // when
      what,
      null, // timeStart
      null, // timeEnd
      newCheck,
      category,
    );
    const updatedTasks = tasks.map(task =>
      task.id === id ? {...task, check: newCheck} : task,
    );
    dispatch(setTasks(updatedTasks));
  };

  async function fetchData() {
    const data = await getItem(name, id);
    dispatch(setCurrentItem(data));
  }

  function handlePress() {
    dispatch(setModalName(name));
    name && fetchData();
  }

  const dynamicStyle = ({pressed}) => [
    styles.listItem,
    {opacity: pressed ? 0.8 : 1},
    isActive && styles.listItemActive,
    check && {opacity: pressed ? 0.3 : 0.5},
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
        {name === 'task' && (
          <Pressable style={styles.listItemCheck} onPress={() => toggleCheck()}>
            {renderCheck(check)}
          </Pressable>
        )}
      </Pressable>
    </>
  );
};

export default ListItem;
