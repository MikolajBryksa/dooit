import React, {useState, useEffect, useRef} from 'react';
import {Modal, View} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import {setCurrentItem} from '../redux/actions';
import {addMenu, updateMenu, deleteMenu} from '../services/menu.service';
import {DIMENSIONS, styles} from '../styles';
import {WhatInput, WhenInput} from '../components/inputs';
import {useTranslation} from 'react-i18next';
import {formatDate} from '../utils';

const MenuModal = ({setShowModal}) => {
  const menu = useSelector(state => state.menu);
  const settings = useSelector(state => state.settings);
  const currentItem = useSelector(state => state.currentItem);
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const [when, setWhen] = useState('');
  const [meal1, setMeal1] = useState('');
  const [meal2, setMeal2] = useState('');
  const [meal3, setMeal3] = useState('');
  const [meal4, setMeal4] = useState('');
  const [meal5, setMeal5] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

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
      const date = formatDate(currentItem.when);
      setWhen(date);
      setMeal1(currentItem.meal1);
      setMeal2(currentItem.meal2);
      setMeal3(currentItem.meal3);
      setMeal4(currentItem.meal4);
      setMeal5(currentItem.meal5);
    } else {
      const today = formatDate();
      setWhen(today);
      setMeal1('');
      setMeal2('');
      setMeal3('');
      setMeal4('');
      setMeal5('');
    }
  }, [currentItem]);

  function handleClose() {
    dispatch(setCurrentItem(null));
    setShowModal(false);
  }

  function handleAdd() {
    addMenu(when, meal1, meal2, meal3, meal4, meal5);
    Toast.show({
      type: 'add',
      text1: 'menu',
      topOffset: DIMENSIONS.padding,
      visibilityTime: 1200,
    });
    handleClose();
  }

  function handleUpdate() {
    if (currentItem) {
      updateMenu(currentItem.id, when, meal1, meal2, meal3, meal4, meal5);
      Toast.show({
        type: 'update',
        text1: 'menu',
        topOffset: DIMENSIONS.padding,
        visibilityTime: 1200,
      });
    }
    handleClose();
  }

  async function handleDelete() {
    if (currentItem) {
      deleteMenu(currentItem.id);
      Toast.show({
        type: 'delete',
        text1: 'menu',
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
          data={menu}
          firstDay={settings.firstDay}
          language={settings.language}
        />
        <WhatInput
          ref={inputRef}
          what={meal1}
          setWhat={setMeal1}
          placeholder={t('meal1')}
          inputModeType="text"
        />
        <WhatInput
          what={meal2}
          setWhat={setMeal2}
          placeholder={t('meal2')}
          inputModeType="text"
        />
        <WhatInput
          what={meal3}
          setWhat={setMeal3}
          placeholder={t('meal3')}
          inputModeType="text"
        />
        <WhatInput
          what={meal4}
          setWhat={setMeal4}
          placeholder={t('meal4')}
          inputModeType="text"
        />
        <WhatInput
          what={meal5}
          setWhat={setMeal5}
          placeholder={t('meal5')}
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
                disabled={!meal1 && !meal2 && !meal3 && !meal4 && !meal5}
              />
            </>
          ) : (
            <ControlButton
              type="accept"
              press={handleAdd}
              disabled={!meal1 && !meal2 && !meal3 && !meal4 && !meal5}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default MenuModal;
