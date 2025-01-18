import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import {setWeights} from '../redux/actions';
import {getEveryWeight, calcWeightChange} from '../services/weights.service';
import {styles} from '../styles';
import WeightsModal from '../modals/weights.modal';
import WeightItem from '../items/weight.item';
import {useTranslation} from 'react-i18next';
import {convertRealmObjects} from '../utils';

const WeightsView = () => {
  const weights = useSelector(state => state.weights);
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [mealsMode, setMealsMode] = useState(false);
  const [weightChange, setWeightChange] = useState(0);
  const [dayDifference, setDayDifference] = useState(0);

  const fetchData = async () => {
    const weights = getEveryWeight();
    dispatch(setWeights(convertRealmObjects(weights)));
  };

  useEffect(() => {
    fetchData();
  }, [showModal, mealsMode]);

  useEffect(() => {
    async function calculateWeightChange() {
      const {weightChange, dayDifference} = calcWeightChange();
      setWeightChange(weightChange);
      setDayDifference(dayDifference);
    }
    calculateWeightChange();
  }, [weights]);

  function handleAdd() {
    setShowModal(true);
  }

  function handleMode() {
    if (mealsMode) {
      setMealsMode(false);
    } else {
      setMealsMode(true);
    }
  }

  return (
    <View style={styles.container}>
      {!mealsMode && showModal && <WeightsModal setShowModal={setShowModal} />}
      {/* {mealsMode && showModal && <WeightsModal setShowModal={setShowModal} />} */}

      {!mealsMode && weights && (
        <>
          {weights.length > 0 ? (
            <View style={styles.header}>
              <Text style={styles.center}>
                {weights.length === 1
                  ? `${t('initial-weight')}: ${weights[0].what} ${
                      settings.weightUnit
                    }`
                  : `${weightChange} ${
                      settings.weightUnit
                    } / ${dayDifference} ${t('days')}`}
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.center}>{t('no-weights')}</Text>
              <ControlButton type="add" press={handleAdd} shape="circle" />
              {/* <ControlButton type="meals" press={handleMode} shape="shadow" /> */}
            </View>
          )}

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
        </>
      )}

      {mealsMode && weights && (
        <>
          <View style={styles.header}>
            <Text style={styles.center}></Text>
          </View>

          <ScrollView style={styles.scrollView}></ScrollView>
        </>
      )}

      {weights && weights.length > 0 && (
        <View style={styles.controllers}>
          {/* {!mealsMode && <ControlButton type="meals" press={handleMode} />}
        {mealsMode && <ControlButton type="back" press={handleMode} />} */}
          <ControlButton type="add" press={handleAdd} />
        </View>
      )}
    </View>
  );
};

export default WeightsView;
