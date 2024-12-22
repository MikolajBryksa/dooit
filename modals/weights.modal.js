import React, {useState, useEffect} from 'react';
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
import {useTranslation} from 'react-i18next';

const WeightsModal = ({setShowModal}) => {
  const weights = useSelector(state => state.weights);
  const currentItem = useSelector(state => state.currentItem);
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();
  const {t} = useTranslation();

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
      setWhat(weights.length ? weights[0].what : '');
    }
  }, [currentItem]);

  function handleClose() {
    dispatch(setCurrentItem(null));
    setShowModal(false);
  }

  function handleAdd() {
    addWeight(when, what);
    Toast.show({
      type: 'add',
      text1: 'weights',
      topOffset: DIMENSIONS.padding,
      visibilityTime: 1200,
    });
    handleClose();
  }

  function handleUpdate() {
    if (currentItem) {
      updateWeight(currentItem.id, when, what);
      Toast.show({
        type: 'update',
        text1: 'weights',
        topOffset: DIMENSIONS.padding,
        visibilityTime: 1200,
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
        visibilityTime: 1200,
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
          firstDay={settings.firstDay}
          language={settings.language}
        />
        <WhatInput
          what={what}
          setWhat={setWhat}
          placeholder={t('enter-weight')}
          category=""
          inputModeType="numeric"
          incrementator={settings.weightGain}
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
