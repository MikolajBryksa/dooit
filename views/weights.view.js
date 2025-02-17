import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import HeaderButton from '../components/header.button';
import {setWeights, setMenu} from '../redux/actions';
import {getEveryWeight, getWeightSummary} from '../services/weights.service';
import {getEveryMenu} from '../services/menu.service';
import {styles} from '../styles';
import WeightsModal from '../modals/weights.modal';
import WeightItem from '../items/weight.item';
import MenuModal from '../modals/menu.modal';
import MenuItem from '../items/menu.item';
import {useTranslation} from 'react-i18next';
import {convertRealmObjects} from '../utils';

const WeightsView = () => {
  const weights = useSelector(state => state.weights);
  const menu = useSelector(state => state.menu);
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [menuMode, setMenuMode] = useState(false);
  const [weightSummary, setWeightSummary] = useState(0);

  const fetchData = async () => {
    const weights = getEveryWeight();
    dispatch(setWeights(convertRealmObjects(weights)));

    const menu = getEveryMenu();
    dispatch(setMenu(convertRealmObjects(menu)));
  };

  useEffect(() => {
    fetchData();
  }, [showModal, menuMode]);

  useEffect(() => {
    const summary = getWeightSummary();
    setWeightSummary(summary);
  }, [weights]);

  function handleAdd() {
    setShowModal(true);
  }

  function handleMode() {
    if (menuMode) {
      setMenuMode(false);
    } else {
      setMenuMode(true);
    }
  }

  return (
    <View style={styles.container}>
      {!menuMode && showModal && <WeightsModal setShowModal={setShowModal} />}
      {menuMode && showModal && <MenuModal setShowModal={setShowModal} />}

      <View style={styles.header}>
        {!menuMode && (
          <>
            <HeaderButton
              name={`${t('header.weights')}: ${weightSummary} ${
                settings.weightUnit
              }`}
              press={handleMode}
              active={true}
            />
            <HeaderButton
              name={t('header.menu')}
              press={handleMode}
              active={false}
            />
          </>
        )}
        {menuMode && (
          <>
            <HeaderButton
              name={`${t('header.weights')}: ${weightSummary} ${
                settings.weightUnit
              }`}
              press={handleMode}
              active={false}
            />
            <HeaderButton name={t('header.menu')} active={true} />
          </>
        )}
      </View>

      {!menuMode && weights && (
        <>
          {weights.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.center}>{t('no-weights')}</Text>
              <ControlButton type="add" press={handleAdd} shape="circle" />
            </View>
          ) : (
            <>
              <ScrollView style={styles.scrollView}>
                {weights.map((item, index) => (
                  <WeightItem
                    key={index}
                    id={item.id}
                    when={item.when}
                    what={item.what}
                    setShowModal={setShowModal}
                  />
                ))}
              </ScrollView>

              <View style={styles.controllers}>
                <ControlButton type="add" press={handleAdd} />
              </View>
            </>
          )}
        </>
      )}

      {menuMode && menu && (
        <>
          {menu.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.center}>{t('no-menu')}</Text>
              <ControlButton type="add" press={handleAdd} shape="circle" />
            </View>
          ) : (
            <>
              <ScrollView style={styles.scrollView}>
                {menu.map((item, index) => (
                  <MenuItem
                    key={index}
                    id={item.id}
                    when={item.when}
                    meal1={item.meal1}
                    meal2={item.meal2}
                    meal3={item.meal3}
                    meal4={item.meal4}
                    meal5={item.meal5}
                    setShowModal={setShowModal}
                  />
                ))}
              </ScrollView>

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

export default WeightsView;
