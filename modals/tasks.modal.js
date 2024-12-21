import React, {useState, useEffect} from 'react';
import {Modal, View} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import {setCurrentItem} from '../redux/actions';
import {addTask, updateTask, deleteTask} from '../services/tasks.service';
import {DIMENSIONS, styles} from '../styles';
import {WhatInput} from '../components/inputs';
import {useTranslation} from 'react-i18next';

const TasksModal = ({setShowModal}) => {
  const category = useSelector(state => state.category);
  const currentItem = useSelector(state => state.currentItem);
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const [when, setWhen] = useState('');
  const [what, setWhat] = useState('');

  useEffect(() => {
    if (currentItem) {
      setWhen(currentItem.when?.toString());
      setWhat(currentItem.what);
    } else {
      setWhen('');
      setWhat('');
    }
  }, [currentItem]);

  function handleClose() {
    dispatch(setCurrentItem(null));
    setShowModal(false);
  }

  function handleAdd() {
    addTask(when, what, category);
    Toast.show({
      type: 'add',
      text1: 'tasks',
      topOffset: DIMENSIONS.padding,
      visibilityTime: 1200,
    });
    handleClose();
  }

  function handleUpdate() {
    if (currentItem) {
      updateTask(currentItem.id, when, what);
      Toast.show({
        type: 'update',
        text1: 'tasks',
        topOffset: DIMENSIONS.padding,
        visibilityTime: 1200,
      });
    }
    handleClose();
  }

  async function handleDelete() {
    if (currentItem) {
      deleteTask(currentItem.id);
      Toast.show({
        type: 'delete',
        text1: 'tasks',
        topOffset: DIMENSIONS.padding,
        visibilityTime: 1200,
      });
    }
    handleClose();
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.container}>
        <WhatInput
          what={what}
          setWhat={setWhat}
          placeholder={category === 'task' ? t('enter-task') : t('enter-item')}
          inputModeType="text"
        />
        <View style={styles.controllers}>
          <ControlButton type="cancel" press={handleClose} />
          {currentItem !== null ? (
            <>
              <ControlButton type="delete" press={handleDelete} />
              <ControlButton
                type="accept"
                press={handleUpdate}
                disabled={!what}
              />
            </>
          ) : (
            <ControlButton type="accept" press={handleAdd} disabled={!what} />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default TasksModal;
