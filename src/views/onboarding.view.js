import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {View, ScrollView} from 'react-native';
import {
  Text,
  Button,
  Card,
  Avatar,
  Checkbox,
  TextInput,
} from 'react-native-paper';
import HabitCard from '@/components/habit.card';
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
  });

  function handleStep1() {
    setStep(2);
  }

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

      if (habitId >= 1 && habitId <= 6) {
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
    setStep(4);
  }

  function handleStep4() {
    let updatedSettings = {...settings, firstLaunch: false};

    if (name.trim()) {
      updateSettingValue('userName', name.trim());
      updatedSettings = {...updatedSettings, userName: name.trim()};
    }

    updateSettingValue('firstLaunch', false);
    dispatch(setSettings(updatedSettings));

    setShowOnboarding(false);
  }

  const fetchAllHabits = () => {
    const updatedHabits = getHabits() || [];
    dispatch(setHabits(updatedHabits));
  };

  // Filters only available habits
  const availableHabits = (habits || []).filter(habit => habit.available);
  const hasSelectedHabits = Object.values(selectedHabits).some(
    selected => selected,
  );

  if (step === 1) {
    return (
      <View style={styles.container__center}>
        <View style={styles.onboarding__bar}>
          <Text variant="headlineMedium">{t('onboarding.step1.welcome')}</Text>
          <Text variant="bodyLarge">{t('onboarding.step1.to-app')}</Text>
        </View>

        <Card style={styles.onboarding__card}>
          <Card.Title
            title={t('onboarding.step1.option1.title')}
            subtitle={t('onboarding.step1.option1.subtitle')}
            left={props => <Avatar.Icon {...props} icon="infinity" />}
            subtitleNumberOfLines={2}
          />
        </Card>

        <Card style={styles.onboarding__card}>
          <Card.Title
            title={t('onboarding.step1.option2.title')}
            subtitle={t('onboarding.step1.option2.subtitle')}
            left={props => <Avatar.Icon {...props} icon="check" />}
            subtitleNumberOfLines={2}
          />
        </Card>

        <Card style={styles.onboarding__card}>
          <Card.Title
            title={t('onboarding.step1.option3.title')}
            subtitle={t('onboarding.step1.option3.subtitle')}
            left={props => <Avatar.Icon {...props} icon="chart-arc" />}
            subtitleNumberOfLines={2}
          />
        </Card>

        <View style={styles.onboarding__bar}>
          <Button
            style={styles.button}
            mode="contained"
            icon="check"
            onPress={() => {
              handleStep1();
            }}>
            {t('button.start')}
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
          {[1, 2, 3, 4, 5, 6].map(habitId => (
            <Card
              key={habitId}
              style={[
                styles.card,
                {
                  opacity: selectedHabits[habitId] ? 1 : 0.6,
                },
              ]}
              onPress={() => handleHabitToggle(habitId)}>
              <Card.Content
                style={{flexDirection: 'row', alignItems: 'center'}}>
                <Avatar.Icon
                  icon={habitIcons[habitId - 1]}
                  size={40}
                  style={{marginRight: 16}}
                />
                <View style={{flex: 1}}>
                  <Text variant="titleMedium">
                    {t(`default-habits.${habitId}.habitName`)}
                  </Text>
                  <Text variant="bodySmall" numberOfLines={2}>
                    {t(`card.instead`)}{' '}
                    {t(`default-habits.${habitId}.habitEnemy`)}
                  </Text>
                </View>
                <Checkbox
                  status={selectedHabits[habitId] ? 'checked' : 'unchecked'}
                  onPress={() => handleHabitToggle(habitId)}
                />
              </Card.Content>
            </Card>
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
                setStep(1);
              }}>
              {t('button.back')}
            </Button>
            <Button
              style={styles.button}
              mode="contained"
              icon={!hasSelectedHabits ? 'lock' : 'check'}
              disabled={!hasSelectedHabits}
              onPress={() => {
                handleStep2();
              }}>
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
            <HabitCard
              key={habit.id}
              id={habit.id}
              habitName={habit.habitName}
              habitEnemy={habit.habitEnemy}
              goodCounter={habit.goodCounter}
              badCounter={habit.badCounter}
              skipCounter={habit.skipCounter}
              repeatDays={habit.repeatDays}
              repeatHours={habit.repeatHours}
              available={habit.available}
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
                  if (habit.id >= 1 && habit.id <= 6) {
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
  } else if (step === 4) {
    return (
      <View style={styles.container__center}>
        <View style={styles.onboarding__bar}>
          <Text variant="headlineMedium">
            {t('onboarding.step4.congratulations')}
          </Text>
          <Text variant="bodyLarge">
            {t('onboarding.step4.ready-to-start')}
          </Text>
          <Text variant="bodyLarge">{t('onboarding.step4.have-fun')}</Text>
        </View>

        <TextInput
          mode="outlined"
          style={styles.onboarding__input}
          placeholder={t('onboarding.step4.name-placeholder')}
          value={name}
          onChangeText={setName}
          maxLength={30}
        />

        <View style={styles.onboarding__buttons}>
          <Button
            style={styles.button}
            mode="outlined"
            icon="arrow-left"
            onPress={() => {
              const habits = getHabits() || [];
              dispatch(setHabits(habits));
              setStep(3);
            }}>
            {t('button.back')}
          </Button>
          <Button
            style={styles.button}
            mode="contained"
            onPress={handleStep4}
            disabled={!name.trim()}
            icon={!name.trim() ? 'lock' : 'rocket-launch'}>
            {t('button.start')}
          </Button>
        </View>
      </View>
    );
  }
};

export default OnboardingView;
