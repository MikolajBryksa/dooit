import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import HeaderButton from '../components/header.button';
import {setCosts, setBudgets} from '../redux/actions';
import {getCostsSummary, getEveryCost} from '../services/costs.service';
import {getBudgetSummary, getEveryBudget} from '../services/budgets.service';
import {styles} from '../styles';
import CostsModal from '../modals/costs.modal';
import BudgetsModal from '../modals/budgets.modal';
import CostItem from '../items/cost.item';
import BudgetItem from '../items/budget.item';
import {useTranslation} from 'react-i18next';
import {convertRealmObjects} from '../utils';

const CostsView = () => {
  const costs = useSelector(state => state.costs);
  const budgets = useSelector(state => state.budgets);
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [budgetMode, setBudgetMode] = useState(false);

  const [budgetSummary, setBudgetSummary] = useState('');
  const [costsSummary, setCostsSummary] = useState('');

  const fetchData = async () => {
    const costs = getEveryCost();
    dispatch(setCosts(convertRealmObjects(costs)));

    const budgets = getEveryBudget();
    dispatch(setBudgets(convertRealmObjects(budgets)));
  };

  useEffect(() => {
    fetchData();
  }, [showModal, budgetMode]);

  useEffect(() => {
    const summary = getBudgetSummary();
    setBudgetSummary(summary);
  }, [budgets]);

  useEffect(() => {
    const summary = getCostsSummary();
    setCostsSummary(summary);
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
      {budgetMode && showModal && <BudgetsModal setShowModal={setShowModal} />}

      <View style={styles.header}>
        {!budgetMode && (
          <>
            <HeaderButton
              name={`${t('header.costs')}: ${costsSummary} ${
                settings.currency
              }`}
              active={true}
            />
            <HeaderButton
              name={`${t('header.budget')}: ${budgetSummary} ${
                settings.currency
              }`}
              press={handleMode}
              active={false}
            />
          </>
        )}
        {budgetMode && (
          <>
            <HeaderButton
              name={`${t('header.costs')}: ${costsSummary} ${
                settings.currency
              }`}
              press={handleMode}
              active={false}
            />
            <HeaderButton
              name={`${t('header.budget')}: ${budgetSummary} ${
                settings.currency
              }`}
              active={true}
            />
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
                    name={item.name}
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

      {budgetMode && budgets && (
        <>
          {budgets.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.center}>{t('no-budgets')}</Text>
              <ControlButton type="add" press={handleAdd} shape="circle" />
            </View>
          ) : (
            <>
              <ScrollView style={styles.scrollView}>
                {budgets.map((item, index) => (
                  <BudgetItem
                    key={index}
                    id={item.id}
                    type={item.type}
                    period={item.period}
                    name={item.name}
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
    </View>
  );
};

export default CostsView;
