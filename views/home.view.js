import React, {useEffect, useState} from 'react';
import {View, ScrollView, Pressable, Text} from 'react-native';
import {useSelector} from 'react-redux';
import {styles} from '../styles';
import {formatDateWithDay} from '../utils';
import HomeItem from '../items/home.item';
import PlansModal from '../modals/plans.modal';
import HabitsModal from '../modals/habits.modal';
import MenuModal from '../modals/menu.modal';
import DayModal from '../modals/day.modal';
import {getTodayPlans} from '../services/plans.service';
import {getTodayHabits} from '../services/habits.service';
import {getTodayMenu} from '../services/menu.service';
import ControlButton from '../components/control.button';
import HeaderButton from '../components/header.button';
import {useTranslation} from 'react-i18next';
import MenuItem from '../items/menu.item';
import {COLORS} from '../styles';
import {renderArrow} from '../utils';

const HomeView = () => {
  const selectedDay = useSelector(state => state.selectedDay);
  const plans = useSelector(state => state.plans);
  const habits = useSelector(state => state.habits);
  const menu = useSelector(state => state.menu);
  const settings = useSelector(state => state.settings);
  const {t} = useTranslation();
  const [todayPlans, setTodayPlans] = useState([]);
  const [todayHabits, setTodayHabits] = useState([]);
  const [todayMenu, setTodayMenu] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('');

  useEffect(() => {
    const fetchTodayData = async () => {
      const todayPlans = getTodayPlans(selectedDay);
      setTodayPlans(todayPlans);

      const todayHabits = getTodayHabits(selectedDay);
      setTodayHabits(todayHabits);

      const todayMenu = getTodayMenu(selectedDay);
      setTodayMenu(todayMenu);
    };

    fetchTodayData();
  }, [selectedDay, showModal, plans, habits, menu]);

  function handleFinishDay() {
    setMode('finish');
    setShowModal(true);
  }

  const dynamicStyle = ({pressed}) => [
    styles.listItem,
    {opacity: pressed ? 0.8 : 1},
    showMenu && {
      borderBottomWidth: 0,
      marginBottom: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
  ];

  const handleShowMenu = () => {
    setShowMenu(!showMenu);
    setMode('menu');
  };

  return (
    <View style={styles.container}>
      {mode === 'plan' && showModal && (
        <PlansModal setShowModal={setShowModal} />
      )}
      {mode === 'habit' && showModal && (
        <HabitsModal setShowModal={setShowModal} />
      )}
      {mode === 'menu' && showModal && (
        <MenuModal setShowModal={setShowModal} />
      )}
      {mode === 'finish' && showModal && (
        <DayModal setShowModal={setShowModal} />
      )}

      <View style={styles.header}>
        <HeaderButton
          name={`${formatDateWithDay(selectedDay, settings.language)}`}
          active={true}
        />
      </View>

      <ScrollView style={styles.scrollView}>
        {todayMenu.length > 0 && (
          <>
            {!showMenu ? (
              <Pressable style={dynamicStyle} onPress={handleShowMenu}>
                <Text
                  style={styles.listItemWhat}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  <Text style={{color: COLORS.primary}}>{t('show-menu')}</Text>
                </Text>
                <Pressable
                  style={styles.listItemCheck}
                  onPress={handleShowMenu}>
                  {renderArrow('down')}
                </Pressable>
              </Pressable>
            ) : (
              <Pressable style={dynamicStyle} onPress={handleShowMenu}>
                <Text
                  style={styles.listItemWhat}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  <Text style={{color: COLORS.primary}}>{t('hide-menu')}</Text>
                </Text>
                <Pressable
                  style={styles.listItemCheck}
                  onPress={handleShowMenu}>
                  {renderArrow('up')}
                </Pressable>
              </Pressable>
            )}

            {showMenu && (
              <MenuItem
                id={todayMenu[0].id}
                when={todayMenu[0].when}
                meal1={todayMenu[0].meal1}
                meal2={todayMenu[0].meal2}
                meal3={todayMenu[0].meal3}
                meal4={todayMenu[0].meal4}
                meal5={todayMenu[0].meal5}
                setShowModal={setShowModal}
                home={true}
              />
            )}
          </>
        )}

        {todayMenu.length > 0 &&
          (todayPlans.length > 0 || todayHabits.length > 0) && (
            <View style={styles.gap} />
          )}

        {todayPlans.map((item, index) => (
          <HomeItem
            key={index}
            type="plan"
            item={item}
            setShowModal={setShowModal}
            setMode={setMode}
          />
        ))}
        {todayPlans.length > 0 && todayHabits.length > 0 && (
          <View style={styles.gap} />
        )}
        {todayHabits.map((item, index) => (
          <HomeItem
            key={index}
            type="habit"
            item={item}
            setShowModal={setShowModal}
            setMode={setMode}
          />
        ))}
      </ScrollView>

      <View style={styles.controllers}>
        <ControlButton type="finish" press={handleFinishDay} />
      </View>
    </View>
  );
};

export default HomeView;
