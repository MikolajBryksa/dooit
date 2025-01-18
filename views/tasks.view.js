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
import {useTranslation} from 'react-i18next';

const TasksView = () => {
  const tasks = useSelector(state => state.tasks);
  const category = useSelector(state => state.category);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [shopMode, setShopMode] = useState(false);
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
      setData(categorizedTasks);
    }
    fetchData();
  }, [showModal, shopMode]);

  function handleAdd() {
    setShowModal(true);
  }

  function handleMode() {
    if (shopMode) {
      setShopMode(false);
      dispatch(setCategory('task'));
    } else {
      setShopMode(true);
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
          {tasks.length > 0 ? (
            <View style={styles.header}>
              <Text style={styles.center}>
                {doneTasks} / {tasks.length}{' '}
                {shopMode ? t('bought') : t('done')}
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.center}>
                {shopMode ? t('no-items-bought') : t('no-tasks-done')}
              </Text>
              <ControlButton type="add" press={handleAdd} shape="circle" />
              {shopMode ? (
                <ControlButton type="back" press={handleMode} shape="shadow" />
              ) : (
                <ControlButton type="shop" press={handleMode} shape="shadow" />
              )}
            </View>
          )}

          <GestureHandlerRootView style={styles.scrollView}>
            <DraggableFlatList
              data={tasks}
              renderItem={renderItem}
              keyExtractor={item => `draggable-item-${item.id}`}
              onDragEnd={handleDragEnd}
            />
          </GestureHandlerRootView>

          {tasks && tasks.length > 0 && !shopMode && (
            <View style={styles.controllers}>
              <ControlButton type="shop" press={handleMode} />
              <ControlButton type="add" press={handleAdd} />
            </View>
          )}
          {tasks && tasks.length > 0 && shopMode && (
            <View style={styles.controllers}>
              <ControlButton type="back" press={handleMode} />
              <ControlButton type="add" press={handleAdd} />
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default TasksView;
