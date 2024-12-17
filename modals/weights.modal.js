import React, {useState, useEffect, useRef} from 'react';
import {Modal, View} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import {setCurrentItem} from '../redux/actions';
import {
  addWeight,
  updateWeight,
  deleteWeight,
} from '../services/weights.service';
import {DIMENSIONS, styles} from '../styles';
import {WhenInput, WhatInput} from '../components/inputs';

const WeightsModal = ({setShowModal}) => {
  const weights = useSelector(state => state.weights);
  const currentItem = useSelector(state => state.currentItem);
  const dispatch = useDispatch();

  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  const [when, setWhen] = useState('');
  const [what, setWhat] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (currentItem) {
      const date = new Date(currentItem.when).toISOString().split('T')[0];
      setWhen(date);
      setWhat(currentItem.what.toFixed(2));
    } else {
      const today = new Date().toISOString().split('T')[0];
      setWhen(today);
      setWhat('');
    }
  }, [currentItem]);

  function handleClose() {
    dispatch(setCurrentItem(null));
    setShowModal(false);
  }

  function handleAdd() {
    addWeight(when, parseFloat(what));
    Toast.show({
      type: 'add',
      text1: 'weights',
      topOffset: DIMENSIONS.padding,
      visibilityTime: 1500,
    });
    handleClose();
  }

  function handleUpdate() {
    if (currentItem) {
      updateWeight(currentItem.id, when, parseFloat(what));
      Toast.show({
        type: 'update',
        text1: 'weights',
        topOffset: DIMENSIONS.padding,
        visibilityTime: 1500,
      });
    }
    handleClose();
  }

  async function handleDelete() {
    if (currentItem) {
      deleteWeight(currentItem.id);
      Toast.show({
        type: 'delete',
        text1: 'weights',
        topOffset: DIMENSIONS.padding,
        visibilityTime: 1500,
      });
    }
    handleClose();
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.container}>
        <WhenInput
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          when={when}
          setWhen={setWhen}
          data={weights}
        />
        <WhatInput
          inputRef={inputRef}
          what={what}
          setWhat={setWhat}
          placeholder="Enter weight"
          category=""
          inputModeType="numeric"
          incrementator={1}
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

export default WeightsModal;
