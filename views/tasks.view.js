import React, {useEffect, useState, useCallback} from 'react';
import {View, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import HeaderButton from '../components/header.button';
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
import {convertRealmObjects} from '../utils';

const TasksView = () => {
  const tasks = useSelector(state => state.tasks);
  const category = useSelector(state => state.category);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [shopMode, setShopMode] = useState(false);
  const [doneTasks, setDoneTasks] = useState(0);
  const [data, setData] = useState(tasks);

  const fetchData = async () => {
    const tasks = getEveryTask();
    const convertedTasks = convertRealmObjects(tasks);

    const categorizedTasks = convertedTasks.filter(
      item => item.category === category,
    );
    dispatch(setTasks(categorizedTasks));
    setData(categorizedTasks);
  };

  useEffect(() => {
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

      <View style={styles.header}>
        {!shopMode && (
          <>
            <HeaderButton name={t('header.tasks')} active={true} />
            <HeaderButton
              name={t('header.shop')}
              press={handleMode}
              active={false}
            />
          </>
        )}
        {shopMode && (
          <>
            <HeaderButton
              name={t('header.tasks')}
              press={handleMode}
              active={false}
            />
            <HeaderButton name={t('header.shop')} active={true} />
          </>
        )}
      </View>

      {tasks && (
        <>
          {tasks.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.center}>
                {shopMode ? t('no-items-bought') : t('no-tasks-done')}
              </Text>
              <ControlButton type="add" press={handleAdd} shape="circle" />
            </View>
          ) : (
            <>
              <GestureHandlerRootView style={styles.scrollView}>
                <DraggableFlatList
                  data={tasks}
                  renderItem={renderItem}
                  keyExtractor={item => `draggable-item-${item.id}`}
                  onDragEnd={handleDragEnd}
                />
              </GestureHandlerRootView>

              <View style={styles.controllers}>
                <ControlButton type="add" press={handleAdd} />
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
};

export default TasksView;
