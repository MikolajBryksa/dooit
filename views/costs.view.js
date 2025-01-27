import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import HeaderButton from '../components/header.button';
import {setCosts} from '../redux/actions';
import {calcAverageCost, getEveryCost} from '../services/costs.service';
import {styles} from '../styles';
import CostsModal from '../modals/costs.modal';
import CostItem from '../items/cost.item';
import {useTranslation} from 'react-i18next';
import {convertRealmObjects} from '../utils';

const CostsView = () => {
  const costs = useSelector(state => state.costs);
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [budgetMode, setBudgetMode] = useState(false);
  const [averageCost, setAverageCost] = useState(0);

  const fetchData = async () => {
    const costs = getEveryCost();
    dispatch(setCosts(convertRealmObjects(costs)));
  };

  useEffect(() => {
    fetchData();
  }, [showModal, budgetMode]);

  useEffect(() => {
    async function calculateDailyCost() {
      const averageCost = calcAverageCost();
      setAverageCost(averageCost);
    }
    calculateDailyCost();
  }, [costs]);

  function handleAdd() {
    setShowModal(true);
  }

  function handleMode() {
    if (budgetMode) {
      setBudgetMode(false);
    } else {
      setBudgetMode(true);
    }
  }

  return (
    <View style={styles.container}>
      {!budgetMode && showModal && <CostsModal setShowModal={setShowModal} />}
      {budgetMode && showModal && <CostsModal setShowModal={setShowModal} />}

      <View style={styles.header}>
        {!budgetMode && (
          <>
            <HeaderButton name={t('header.costs')} active={true} />
            <HeaderButton
              name={t('header.budget')}
              press={handleMode}
              active={false}
            />
          </>
        )}
        {budgetMode && (
          <>
            <HeaderButton
              name={t('header.costs')}
              press={handleMode}
              active={false}
            />
            <HeaderButton name={t('header.budget')} active={true} />
          </>
        )}
      </View>

      {!budgetMode && costs && (
        <>
          {costs.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.center}>{t('no-costs')}</Text>
              <ControlButton type="add" press={handleAdd} shape="circle" />
            </View>
          ) : (
            <>
              <ScrollView style={styles.scrollView}>
                {costs.map((item, index) => (
                  <CostItem
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

      {budgetMode && costs && (
        <>
          <View style={styles.header}>
            <Text style={styles.center}></Text>
          </View>

          <ScrollView style={styles.scrollView}></ScrollView>
        </>
      )}
    </View>
  );
};

export default CostsView;
