import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import Control from '../components/control';
import List from '../components/list';
import { setTasks, setModalName } from '../redux/actions';
import { getEveryItem } from '../services';
import { styles } from '../styles';

export default function Tasks() {
  const tasks = useSelector((state) => state.tasks);
  const modalName = useSelector((state) => state.modalName);
  const dispatch = useDispatch();

  async function fetchData() {
    const data = await getEveryItem('task');
    dispatch(setTasks(data));
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
          <List initialItems={tasks} name='task' />
          <View style={styles.controllers}>
            <Control type='add' press={handleAdd} />
          </View>
        </>
      )}
    </View>
  );
}
