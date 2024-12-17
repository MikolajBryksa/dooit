import React, {useEffect, useState, useCallback} from 'react';
import {View, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import {setTasks, setCategory} from '../redux/actions';
import {getEveryTask} from '../services/tasks.service';
import {styles} from '../styles';
import TasksModal from '../modals/tasks.modal';
import TaskItem from '../items/task.item';
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import realm from '../storage/schemas';

const TasksView = () => {
  const tasks = useSelector(state => state.tasks);
  const category = useSelector(state => state.category);
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [itemMode, setItemMode] = useState(false);
  const [doneTasks, setDoneTasks] = useState(0);
  const [data, setData] = useState(tasks);

  useEffect(() => {
    async function fetchData() {
      const tasks = getEveryTask();
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
    fetchData();
  }, [showModal, itemMode]);

  function handleAdd() {
    setShowModal(true);
  }

  function handleItems() {
    if (itemMode) {
      setItemMode(false);
      dispatch(setCategory('task'));
    } else {
      setItemMode(true);
      dispatch(setCategory('item'));
    }
  }

  useEffect(() => {
    function calcDoneTasks(tasks) {
      const doneTasks = tasks.filter(item => item.check === true);
      setDoneTasks(doneTasks.length);
    }
    calcDoneTasks(tasks);
  }, [tasks, category]);

  const renderItem = useCallback(({item, index, drag, isActive}) => {
    return (
      <TaskItem
        key={index}
        id={item.id}
        when={item.when}
        what={item.what}
        drag={drag}
        isActive={isActive}
        check={item.check}
        category={item.category}
        setShowModal={setShowModal}
      />
    );
  }, []);

  const handleDragEnd = ({data}) => {
    const newData = data.map((item, index) => {
      return {...item, when: index + 1};
    });
    setData(newData);
    realm.write(() => {
      newData.forEach(item => {
        let task = realm.objectForPrimaryKey('Task', item.id);
        if (task) {
          task.when = item.when;
        }
      });
    });
    dispatch(setTasks(newData));
  };

  return (
    <View style={styles.container}>
      {showModal && <TasksModal setShowModal={setShowModal} />}
      {tasks && (
        <>
          <View style={styles.header}>
            <Text style={styles.center}>
              {doneTasks} / {tasks.length} {itemMode ? 'bought' : 'done'}
            </Text>
          </View>

          <GestureHandlerRootView style={styles.scrollView}>
            <DraggableFlatList
              data={tasks}
              renderItem={renderItem}
              keyExtractor={item => `draggable-item-${item.id}`}
              onDragEnd={handleDragEnd}
            />
          </GestureHandlerRootView>

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

export default TasksView;
