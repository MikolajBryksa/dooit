import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {View, ScrollView} from 'react-native';
import {Text, Button, TextInput} from 'react-native-paper';
import HabitComponent from '@/components/habit.component';
import EditModal from '@/modals/edit.modal';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {updateSettingValue} from '@/services/settings.service';
import {setSettings, setHabits} from '@/redux/actions';
import {
  createDefaultHabits,
  updateHabit,
  getHabits,
} from '@/services/habits.service';
import {requestNotificationPermission} from '@/services/notifications.service';
import {habitIcons} from '@/constants';
import AddModal from '@/modals/add.modal';
import SettingComponent from '@/components/setting.component';

const OnboardingView = ({setShowOnboarding}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);
  const habits = useSelector(state => state.habits);
  const [step, setStep] = useState(1);
  const [visibleEditModal, setVisibleEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [name, setName] = useState('');
  const [visibleAddModal, setVisibleAddModal] = useState(false);
  const [habitsCreated, setHabitsCreated] = useState(false);

  const [selectedHabits, setSelectedHabits] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
  });

  // Initialize state from existing habits if user returns to onboarding
  useEffect(() => {
    if (settings?.userName) {
      setName(settings.userName);
    }

    const existingHabits = getHabits() || [];

    const defaultHabitsExist = existingHabits.some(
      habit => habit.id >= 1 && habit.id <= 7,
    );

    if (defaultHabitsExist) {
      setHabitsCreated(true);

      const restoredSelection = {};
      existingHabits.forEach(habit => {
        if (habit.id >= 1 && habit.id <= 7) {
          restoredSelection[habit.id] = habit.available;
        }
      });

      setSelectedHabits(prev => ({
        ...prev,
        ...restoredSelection,
      }));
    }
  }, [settings]);

  function handleStep1() {
    let updatedSettings = {...settings};
    if (name.trim()) {
      updateSettingValue('userName', name.trim());
      updatedSettings = {...updatedSettings, userName: name.trim()};
    }
    dispatch(setSettings(updatedSettings));
    setStep(2);
  }

  const fetchAllHabits = () => {
    const updatedHabits = getHabits() || [];
    dispatch(setHabits(updatedHabits));
  };

  function handleHabitToggle(habitId) {
    setSelectedHabits(prev => ({
      ...prev,
      [habitId]: !prev[habitId],
    }));
  }

  const handleEditModal = (habitId, field, value, label) => {
    setEditModalData({habitId, field, value, label});
    setVisibleEditModal(true);
  };

  const closeEditModal = () => {
    setTimeout(() => {
      setVisibleEditModal(false);
    }, 100);
  };

  function handleStep2() {
    if (!habitsCreated) {
      createDefaultHabits();
      setHabitsCreated(true);
    }

    const allHabits = getHabits();
    allHabits.forEach(habit => {
      const habitId = habit.id;

      if (habitId >= 1 && habitId <= 7) {
        const isSelected = selectedHabits[habitId];
        updateHabit(habit.id, {
          available: isSelected,
        });
      }
    });

    const habits = getHabits() || [];
    dispatch(setHabits(habits));
    setStep(3);
  }

  function handleStep3() {
    requestNotificationPermission(settings, dispatch, setSettings);
    setShowOnboarding(false);
  }

  // Filters only available habits
  const availableHabits = (habits || []).filter(habit => habit.available);
  const hasSelectedHabits = Object.values(selectedHabits).some(
    selected => selected,
  );

  if (step === 1) {
    return (
      <View style={styles.container__center}>
        <View style={styles.onboarding__bar}>
          <Text variant="headlineMedium">{t('onboarding.step1.title')}</Text>
          <Text variant="bodyLarge">{t('onboarding.step1.subtitle')}</Text>
        </View>

        <TextInput
          mode="outlined"
          style={styles.onboarding__input}
          placeholder={t('onboarding.step1.name')}
          value={name}
          onChangeText={setName}
          maxLength={30}
        />

        <View style={styles.onboarding__bar}>
          <Button
            style={styles.button}
            mode="contained"
            onPress={handleStep1}
            disabled={!name.trim()}
            icon={!name.trim() ? 'lock' : 'check'}>
            {t('button.save')}
          </Button>
        </View>
      </View>
    );
  } else if (step === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.onboarding__bar}>
          <Text variant="headlineMedium">{t('onboarding.step2.choose')}</Text>
          <Text variant="bodyLarge">{t('onboarding.step2.which-habits')}</Text>
        </View>

        <ScrollView style={styles.container}>
          {[1, 2, 3, 4, 5, 6, 7].map(habitId => (
            <View
              key={habitId}
              style={{opacity: selectedHabits[habitId] ? 1 : 0.6}}>
              <SettingComponent
                label={t(`default-habits.${habitId}.habitName`)}
                leftIcon={habitIcons[habitId - 1]}
                checkboxValue={selectedHabits[habitId]}
                onCheckboxToggle={() => handleHabitToggle(habitId)}
                onPress={() => handleHabitToggle(habitId)}
                showChip={false}
              />
            </View>
          ))}
          <View style={styles.gap} />
        </ScrollView>

        <View style={styles.onboarding__bar}>
          <View style={styles.onboarding__buttons}>
            <Button
              style={styles.button}
              mode="outlined"
              icon="arrow-left"
              onPress={() => setStep(1)}>
              {t('button.back')}
            </Button>
            <Button
              style={styles.button}
              mode="contained"
              icon={!hasSelectedHabits ? 'lock' : 'check'}
              disabled={!hasSelectedHabits}
              onPress={handleStep2}>
              {t('button.save')}
            </Button>
          </View>
        </View>
      </View>
    );
  } else if (step === 3) {
    return (
      <View style={styles.container}>
        <View style={styles.onboarding__bar}>
          <Text variant="headlineMedium">
            {t('onboarding.step3.select-repetition')}
          </Text>
          <Text variant="bodyLarge">
            {t('onboarding.step3.accept-default')}
          </Text>
        </View>

        <ScrollView style={styles.container}>
          {availableHabits.map(habit => (
            <HabitComponent
              key={habit.id}
              id={habit.id}
              habitName={habit.habitName}
              goodCounter={habit.goodCounter}
              badCounter={habit.badCounter}
              repeatDays={habit.repeatDays}
              repeatHours={habit.repeatHours}
              available={habit.available}
              icon={habit.icon}
              fetchAllHabits={fetchAllHabits}
              onEdit={handleEditModal}
              onboardingMode={true}
            />
          ))}
          <View style={styles.gap} />
        </ScrollView>

        <View style={styles.onboarding__bar}>
          <View style={styles.onboarding__buttons}>
            <Button
              style={styles.button}
              mode="outlined"
              icon="arrow-left"
              onPress={() => {
                const currentHabits = getHabits() || [];
                const updatedSelectedHabits = {};

                currentHabits.forEach(habit => {
                  if (habit.id >= 1 && habit.id <= 7) {
                    updatedSelectedHabits[habit.id] = habit.available;
                  }
                });

                setSelectedHabits(updatedSelectedHabits);
                dispatch(setHabits(currentHabits));
                setStep(2);
              }}>
              {t('button.back')}
            </Button>
            <Button
              mode="outlined"
              style={styles.button}
              icon="plus"
              onPress={() => setVisibleAddModal(true)}>
              {t('button.add')}
            </Button>
            <Button
              style={styles.button}
              mode="contained"
              onPress={handleStep3}
              icon="check">
              {t('button.save')}
            </Button>
          </View>
        </View>

        <EditModal
          visible={visibleEditModal}
          onDismiss={closeEditModal}
          field={editModalData?.field}
          value={editModalData?.value}
          label={editModalData?.label}
          habitId={editModalData?.habitId}
          fetchAllHabits={fetchAllHabits}
        />

        <AddModal
          visible={visibleAddModal}
          onDismiss={() => setVisibleAddModal(false)}
          fetchAllHabits={fetchAllHabits}
        />
      </View>
    );
  }
};

export default OnboardingView;
