import React, {useState, useEffect, useRef} from 'react';
import {Modal, View, Pressable, Text} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import {setCurrentItem} from '../redux/actions';
import {
  addBudget,
  updateBudget,
  deleteBudget,
} from '../services/budgets.service';
import {DIMENSIONS, styles} from '../styles';
import {WhatInput} from '../components/inputs';
import {useTranslation} from 'react-i18next';

const BudgetsModal = ({setShowModal}) => {
  const currentItem = useSelector(state => state.currentItem);
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const [type, setType] = useState('expense');
  const [period, setPeriod] = useState('monthly');
  const [name, setName] = useState('');
  const [what, setWhat] = useState('');

  const inputRef = useRef(null);
  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (currentItem) {
      setType(currentItem.type);
      setPeriod(currentItem.period);
      setName(currentItem.name);
      setWhat(currentItem.what.toFixed(2));
    } else {
      setType('expense');
      setPeriod('monthly');
      setName('');
      setWhat('');
    }
  }, [currentItem]);

  function handleClose() {
    dispatch(setCurrentItem(null));
    setShowModal(false);
  }

  function handleAdd() {
    addBudget(type, period, name, what);
    Toast.show({
      type: 'add',
      text1: 'budgets',
      topOffset: DIMENSIONS.padding,
      visibilityTime: 1200,
    });
    handleClose();
  }

  function handleUpdate() {
    if (currentItem) {
      updateBudget(currentItem.id, type, period, name, what);
      Toast.show({
        type: 'update',
        text1: 'budgets',
        topOffset: DIMENSIONS.padding,
        visibilityTime: 1200,
      });
    }
    handleClose();
  }

  async function handleDelete() {
    if (currentItem) {
      deleteBudget(currentItem.id);
      Toast.show({
        type: 'delete',
        text1: 'budgets',
        topOffset: DIMENSIONS.padding,
        visibilityTime: 1200,
      });
    }
    handleClose();
  }

  function handleType() {
    const newType = type === 'income' ? 'expense' : 'income';
    setType(newType);
  }

  function handlePeriod() {
    const newPeriod = period === 'monthly' ? 'yearly' : 'monthly';
    setPeriod(newPeriod);
  }

  const dynamicStyle = ({pressed}) => [
    styles.listItem,
    {opacity: pressed ? 0.8 : 1},
  ];

  return (
    <Modal transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.container}>
        <Pressable style={dynamicStyle} onPress={() => handleType()}>
          <Text style={styles.listItemDesc}>{t('entry-type')} </Text>
          <Text style={styles.listItemChange}>{t(`${type}`)}</Text>
        </Pressable>

        <Pressable style={dynamicStyle} onPress={() => handlePeriod()}>
          <Text style={styles.listItemDesc}>{t('entry-period')} </Text>
          <Text style={styles.listItemChange}>{t(`${period}`)}</Text>
        </Pressable>

        <WhatInput
          ref={inputRef}
          what={name}
          setWhat={setName}
          placeholder={t('enter-name')}
          inputModeType="text"
        />
        <WhatInput
          what={what}
          setWhat={setWhat}
          placeholder={t('enter-amount')}
          inputModeType="numeric"
          incrementator={settings.costGain}
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

export default BudgetsModal;
