import React, {useEffect, useState, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {View, Text, ScrollView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import HeaderButton from '../components/header.button';
import PlanItem from '../items/plan.item';
import HabitItem from '../items/habit.item';
import realm from '../storage/schemas';
import {setPlans, setHabits} from '../redux/actions';
import {getEveryPlan} from '../services/plans.service';
import {getEveryHabit} from '../services/habits.service';
import {styles} from '../styles';
import PlansModal from '../modals/plans.modal';
import HabitsModal from '../modals/habits.modal';
import {useTranslation} from 'react-i18next';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {isDaily} from '../utils';
import {convertRealmObjects} from '../utils';

const PlansView = () => {
  const plans = useSelector(state => state.plans);
  const habits = useSelector(state => state.habits);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [habitsMode, setHabitsMode] = useState(false);
  const [data, setData] = useState(habits);

  const fetchData = async () => {
    const plans = getEveryPlan();
    dispatch(setPlans(convertRealmObjects(plans)));

    const habits = getEveryHabit();
    const convertedHabits = convertRealmObjects(habits);
    dispatch(setHabits(convertedHabits));
    setData(convertRealmObjects(convertedHabits));
  };

  useEffect(() => {
    fetchData();
  }, [showModal, habitsMode]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  function handleAdd() {
    setShowModal(true);
  }

  function handleMode() {
    if (habitsMode) {
      setHabitsMode(false);
    } else {
      setHabitsMode(true);
    }
  }

  const renderItem = useCallback(({item, index, drag, isActive}) => {
    return (
      <HabitItem
        key={index}
        id={item.id}
        when={item.when}
        what={item.what}
        drag={drag}
        isActive={isActive}
        setShowModal={setShowModal}
        time={item.time}
        monday={item.monday}
        tuesday={item.tuesday}
        wednesday={item.wednesday}
        thursday={item.thursday}
        friday={item.friday}
        saturday={item.saturday}
        sunday={item.sunday}
        daily={isDaily(item)}
      />
    );
  }, []);

  const handleDragEnd = ({data}) => {
    const newData = data.map((item, index) => {
      return {...item, when: index + 1};
    });
    setData(newData);
    realm.write(() => {
      newData.forEach(item => {
        let habit = realm.objectForPrimaryKey('Habit', item.id);
        if (habit) {
          habit.when = item.when;
        }
      });
    });
    dispatch(setHabits(newData));
  };

  return (
    <View style={styles.container}>
      {!habitsMode && showModal && <PlansModal setShowModal={setShowModal} />}
      {habitsMode && showModal && <HabitsModal setShowModal={setShowModal} />}

      <View style={styles.header}>
        {!habitsMode && (
          <>
            <HeaderButton name={t('header.plans')} active={true} />
            <HeaderButton
              name={t('header.habits')}
              press={handleMode}
              active={false}
            />
          </>
        )}
        {habitsMode && (
          <>
            <HeaderButton
              name={t('header.plans')}
              press={handleMode}
              active={false}
            />
            <HeaderButton name={t('header.habits')} active={true} />
          </>
        )}
      </View>

      {plans && !habitsMode && (
        <>
          {plans.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.center}>{t('no-plans')}</Text>
              <ControlButton type="add" press={handleAdd} shape="circle" />
            </View>
          ) : (
            <>
              <ScrollView style={styles.scrollView}>
                {plans.map((item, index) => (
                  <PlanItem
                    key={index}
                    id={item.id}
                    when={item.when}
                    what={item.what}
                    time={item.time}
                    setShowModal={setShowModal}
                    check={item.check}
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

      {habits && habitsMode && (
        <>
          {habits.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.center}>{t('no-habits')}</Text>
              <ControlButton type="add" press={handleAdd} shape="circle" />
            </View>
          ) : (
            <>
              <GestureHandlerRootView style={styles.scrollView}>
                <DraggableFlatList
                  data={data}
                  renderItem={renderItem}
                  keyExtractor={item => `draggable-item-${item.id}`}
                  onDragEnd={handleDragEnd}
                />
              </GestureHandlerRootView>

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

export default PlansView;
