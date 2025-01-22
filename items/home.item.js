import React, {useState, useEffect} from 'react';
import {Pressable, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setCurrentItem} from '../redux/actions';
import {COLORS, styles} from '../styles';
import {renderCheck} from '../utils';
import {updatePlan} from '../services/plans.service';
import {updateHabit} from '../services/habits.service';
import {setPlans, setHabits} from '../redux/actions';

const HomeItem = ({type, item, setShowModal, setMode}) => {
  const dispatch = useDispatch();
  const plans = useSelector(state => state.plans);
  const habits = useSelector(state => state.habits);
  const [check, setCheck] = useState(item.check);

  useEffect(() => {
    setCheck(item.check);
  }, [item.check]);

  const toggleCheck = async () => {
    const newCheck = !check;
    setCheck(newCheck);
    if (type === 'plan') {
      updatePlan(item.id, item.when, item.what, item.time, newCheck);
      const updatedPlans = plans.map(plan =>
        plan.id === item.id ? {...plan, check: newCheck} : plan,
      );
      dispatch(setPlans(updatedPlans));
    }
    if (type === 'habit') {
      updateHabit(
        item.id,
        item.when,
        item.what,
        item.time,
        (days = {
          monday: item.monday,
          tuesday: item.tuesday,
          wednesday: item.wednesday,
          thursday: item.thursday,
          friday: item.friday,
          saturday: item.saturday,
          sunday: item.sunday,
        }),
        newCheck,
      );
      const updatedHabits = habits.map(habit =>
        habit.id === item.id ? {...habit, check: newCheck} : habit,
      );
      dispatch(setHabits(updatedHabits));
    }
  };

  const handlePress = () => {
    const serializableItem = {
      ...item,
      when: type === 'plan' ? item.when.toISOString() : item.when.toString(),
    };
    dispatch(setCurrentItem(serializableItem));
    setMode(type);
    setShowModal(true);
  };

  const dynamicStyle = ({pressed}) => [
    styles.listItem,
    {opacity: pressed ? 0.8 : 1},
    check && {opacity: pressed ? 0.3 : 0.5},
  ];

  return (
    <>
      <Pressable style={dynamicStyle} onPress={() => handlePress()}>
        <Text
          style={styles.listItemWhat}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.time ? (
            <Text style={{color: COLORS.primary}}>{`${item.time} | `}</Text>
          ) : null}
          {item.what}
        </Text>
        <Pressable style={styles.listItemCheck} onPress={() => toggleCheck()}>
          {renderCheck(check)}
        </Pressable>
      </Pressable>
    </>
  );
};

export default HomeItem;
