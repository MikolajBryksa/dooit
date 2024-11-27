import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/ControlButton';
import List from '../components/List';
import {setTasks, setModalName, setCategory} from '../redux/actions';
import {getEveryItem} from '../storage/services';
import {styles} from '../styles';

const Tasks = () => {
  const tasks = useSelector(state => state.tasks);
  const modalName = useSelector(state => state.modalName);
  const category = useSelector(state => state.category);
  const dispatch = useDispatch();
  const [itemMode, setItemMode] = useState(false);
  const [doneTasks, setDoneTasks] = useState(0);

  // Data

  async function fetchData() {
    const tasks = getEveryItem('task', false);
    const formattedTasks = tasks.map(item => ({
      ...item,
      what: item.what,
      when: item.when,
    }));
    const categorizedTasks = formattedTasks.filter(
      item => item.category === category,
    );
    dispatch(setTasks(categorizedTasks));
  }

  useEffect(() => {
    fetchData();
  }, [modalName, itemMode]);

  function handleAdd() {
    dispatch(setModalName('task'));
  }

  // Mode

  function handleItems() {
    if (itemMode) {
      setItemMode(false);
      dispatch(setCategory('task'));
    } else {
      setItemMode(true);
      dispatch(setCategory('item'));
    }
  }

  // Header

  function calcDoneTasks(tasks) {
    const doneTasks = tasks.filter(item => item.check === true);
    setDoneTasks(doneTasks.length);
  }

  useEffect(() => {
    calcDoneTasks(tasks);
  }, [tasks, category]);

  // View

  return (
    <View style={styles.container}>
      {tasks && (
        <>
          <View style={styles.header}>
            <Text style={styles.center}>
              {doneTasks} / {tasks.length} {itemMode ? 'bought' : 'done'}
            </Text>
          </View>

          <List items={tasks} name="task" />
          <View style={styles.controllers}>
            {!itemMode && <ControlButton type="item" press={handleItems} />}
            {itemMode && <ControlButton type="cancel" press={handleItems} />}
            <ControlButton type="add" press={handleAdd} />
          </View>
        </>
      )}
    </View>
  );
};

export default Tasks;
