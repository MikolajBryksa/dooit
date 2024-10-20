import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import ControlButton from '../components/ControlButton';
import List from '../components/List';
import {setTasks, setModalName} from '../redux/actions';
import {getEveryItem} from '../storage/services';
import {styles} from '../styles';

const Tasks = () => {
  const tasks = useSelector(state => state.tasks);
  const modalName = useSelector(state => state.modalName);
  const dispatch = useDispatch();

  async function fetchData() {
    const tasks = getEveryItem('task', false);
    const formattedTasks = tasks.map(item => ({
      ...item,
      what: item.what,
      when: item.when,
    }));
    dispatch(setTasks(formattedTasks));
  }

  useEffect(() => {
    fetchData();
  }, [modalName]);

  function handleAdd() {
    dispatch(setModalName('task'));
  }

  return (
    <View style={styles.container}>
      {tasks && (
        <>
          <List items={tasks} name="task" />
          <View style={styles.controllers}>
            <ControlButton type="add" press={handleAdd} />
          </View>
        </>
      )}
    </View>
  );
};

export default Tasks;
