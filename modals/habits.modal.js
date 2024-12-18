import React, {useState, useEffect, useRef} from 'react';
import {Modal, View, TextInput} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import {setCurrentItem} from '../redux/actions';
import {addHabit, updateHabit, deleteHabit} from '../services/habits.service';
import {DIMENSIONS, styles} from '../styles';
import {WhatInput} from '../components/inputs';

const HabitsModal = ({setShowModal}) => {
  const currentItem = useSelector(state => state.currentItem);
  const dispatch = useDispatch();

  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

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
    addHabit(when, what);
    Toast.show({
      type: 'add',
      text1: 'habits',
      topOffset: DIMENSIONS.padding,
      visibilityTime: 1200,
    });
    handleClose();
  }

  function handleUpdate() {
    if (currentItem) {
      updateHabit(currentItem.id, when, what);
      Toast.show({
        type: 'update',
        text1: 'habits',
        topOffset: DIMENSIONS.padding,
        visibilityTime: 1200,
      });
    }
    handleClose();
  }

  async function handleDelete() {
    if (currentItem) {
      deleteHabit(currentItem.id);
      Toast.show({
        type: 'delete',
        text1: 'habits',
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
          inputRef={inputRef}
          what={what}
          setWhat={setWhat}
          placeholder="Enter habit"
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

export default HabitsModal;
