import React, {useState} from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setCurrentItem, setTasks} from '../redux/actions';
import {getTask} from '../services/tasks.service';
import {updateTask} from '../services/tasks.service';
import {styles} from '../styles';
import {renderCheck} from '../utils';

const TaskItem = ({
  id,
  when,
  what,
  drag,
  isActive,
  check: initialCheck,
  setShowModal,
}) => {
  const dispatch = useDispatch();
  const tasks = useSelector(state => state.tasks);
  const [check, setCheck] = useState(initialCheck);

  const toggleCheck = async () => {
    const newCheck = !check;
    setCheck(newCheck);
    updateTask(id, when, what, newCheck);
    const updatedTasks = tasks.map(task =>
      task.id === id ? {...task, check: newCheck} : task,
    );
    dispatch(setTasks(updatedTasks));
  };

  function handlePress() {
    const data = getTask(id);
    dispatch(setCurrentItem(data));
    setShowModal(true);
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
        <Pressable style={styles.listItemCheck} onPress={() => toggleCheck()}>
          {renderCheck(check)}
        </Pressable>
      </Pressable>
    </>
  );
};

export default TaskItem;
