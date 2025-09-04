import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {View, ScrollView} from 'react-native';
import {Text, Button, Card, Avatar, Checkbox} from 'react-native-paper';
import HabitCard from '@/components/habit.card';
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

const OnboardingView = ({setShowOnboarding}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);
  const habits = useSelector(state => state.habits);
  const [step, setStep] = useState(1);

  const [selectedHabits, setSelectedHabits] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
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

  function handleStep2() {
    createDefaultHabits();

    const allHabits = getHabits();
    allHabits.forEach(habit => {
      const habitId = habit.id;
      const isSelected = selectedHabits[habitId];

      updateHabit(habit.id, {
        available: isSelected,
      });
    });

    const habits = getHabits() || [];
    dispatch(setHabits(habits));
    setStep(3);
  }

  function handleStep3() {
    updateSettingValue('firstLaunch', false);
    const updatedSettings = {...settings, firstLaunch: false};
    dispatch(setSettings(updatedSettings));

    setShowOnboarding(false);
    requestNotificationPermission(settings, dispatch, setSettings);
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
            left={props => <Avatar.Icon {...props} icon="heart" />}
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
            onPress={() => {
              handleStep1();
            }}>
            {t('onboarding.step1.choose-habits')}
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
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(habitId => (
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
          <Button
            style={styles.button}
            mode="contained"
            disabled={!hasSelectedHabits}
            onPress={() => {
              handleStep2();
            }}>
            {t('onboarding.step2.select-time')}
          </Button>
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
              onboardingMode={true}
            />
          ))}
          <View style={styles.gap} />
        </ScrollView>

        <View style={styles.onboarding__bar}>
          <Button style={styles.button} mode="contained" onPress={handleStep3}>
            {t('onboarding.step3.start')}
          </Button>
        </View>
      </View>
    );
  }
};

export default OnboardingView;
