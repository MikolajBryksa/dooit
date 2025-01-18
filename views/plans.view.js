import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import PlanItem from '../items/plan.item';
import HabitItem from '../items/habit.item';
import realm from '../storage/schemas';
import {setPlans, setHabits} from '../redux/actions';
import {getEveryPlan} from '../services/plans.service';
import {getEveryHabit} from '../services/habits.service';
import {styles} from '../styles';
import {formatDateWithDay} from '../utils';
import {convertToISO} from '../utils';
import PlansModal from '../modals/plans.modal';
import HabitsModal from '../modals/habits.modal';
import {useTranslation} from 'react-i18next';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {isDaily} from '../utils';

const PlansView = () => {
  const plans = useSelector(state => state.plans);
  const habits = useSelector(state => state.habits);
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [habitsMode, setHabitsMode] = useState(false);
  const [data, setData] = useState(habits);

  useEffect(() => {
    async function fetchData() {
      const plans = getEveryPlan(settings.rowsNumber);
      const formattedData = plans.map(item => ({
        ...item,
        what: item.what,
        when: convertToISO(new Date(item.when).toLocaleDateString()),
      }));
      dispatch(setPlans(formattedData));

      const habits = getEveryHabit();
      const formattedHabits = habits.map(item => ({
        ...item,
        what: item.what,
        when: item.when,
      }));
      dispatch(setHabits(formattedHabits));
      setData(formattedHabits);
    }

    fetchData();
  }, [showModal, habitsMode, settings.rowsNumber]);

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

      {plans && !habitsMode && (
        <>
          <View style={styles.header}>
            <Text style={styles.center}>
              {plans.length > 0
                ? formatDateWithDay(new Date(), settings.language)
                : t('no-plans')}
            </Text>
          </View>
          <ScrollView style={styles.scrollView}>
            {plans.map((item, index) => (
              <PlanItem
                key={index}
                id={item.id}
                when={item.when}
                what={item.what}
                time={item.time}
                setShowModal={setShowModal}
              />
            ))}
          </ScrollView>
        </>
      )}

      {habits && habitsMode && (
        <>
          <View style={styles.header}>
            <Text style={styles.center}>
              {habits.length > 0
                ? formatDateWithDay(new Date(), settings.language)
                : t('no-habits')}
            </Text>
          </View>

          <GestureHandlerRootView style={styles.scrollView}>
            <DraggableFlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={item => `draggable-item-${item.id}`}
              onDragEnd={handleDragEnd}
            />
          </GestureHandlerRootView>
        </>
      )}

      <View style={styles.controllers}>
        {!habitsMode && <ControlButton type="habits" press={handleMode} />}
        {habitsMode && <ControlButton type="back" press={handleMode} />}
        <ControlButton type="add" press={handleAdd} />
      </View>
    </View>
  );
};

export default PlansView;
