import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {View, ScrollView} from 'react-native';
import {Text, Button, Card, Avatar, Checkbox} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {updateSettingValue} from '@/services/settings.service';
import {setSettings} from '@/redux/actions';
import {
  createDefaultHabits,
  updateHabit,
  getHabits,
} from '@/services/habits.service';
import notifee from '@notifee/react-native';

const OnboardingView = ({setShowOnboarding}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);
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

    allHabits.forEach((habit, index) => {
      const habitId = index + 1;
      const isSelected = selectedHabits[habitId];

      updateHabit(
        habit.id,
        habit.habitName,
        habit.goodChoice,
        habit.badChoice,
        habit.score,
        habit.level,
        habit.duration,
        habit.repeatDays,
        habit.repeatHours,
        isSelected,
      );
    });

    setStep(3);
  }

  function handleStep3() {
    updateSettingValue('firstLaunch', false);
    const updatedSettings = {...settings, firstLaunch: false};
    dispatch(setSettings(updatedSettings));
    setShowOnboarding(false);
    handleNotificationPermission();
  }

  async function handleNotificationPermission() {
    await notifee.requestPermission();
    const settingsStatus = await notifee.getNotificationSettings();
    const granted =
      settingsStatus.authorizationStatus === 1 ||
      settingsStatus.authorizationStatus === 2;
    updateSettingValue('notifications', granted);
    const updatedSettings = {...settings, notifications: granted};
    dispatch(setSettings(updatedSettings));
  }

  const hasSelectedHabits = Object.values(selectedHabits).some(
    selected => selected,
  );

  if (step === 1) {
    return (
      <View style={styles.container__center}>
        <View style={styles.onboarding__bar}>
          <Text variant="headlineMedium">{t('onboarding.welcome')}</Text>
          <Text variant="bodyLarge">{t('onboarding.to-app')}</Text>
        </View>

        <Card style={styles.onboarding__card}>
          <Card.Title
            title={t('onboarding.option.1.title')}
            subtitle={t('onboarding.option.1.subtitle')}
            left={props => <Avatar.Icon {...props} icon="infinity" />}
            subtitleNumberOfLines={2}
          />
        </Card>

        <Card style={styles.onboarding__card}>
          <Card.Title
            title={t('onboarding.option.2.title')}
            subtitle={t('onboarding.option.2.subtitle')}
            left={props => <Avatar.Icon {...props} icon="chart-bar" />}
            subtitleNumberOfLines={2}
          />
        </Card>

        <Card style={styles.onboarding__card}>
          <Card.Title
            title={t('onboarding.option.3.title')}
            subtitle={t('onboarding.option.3.subtitle')}
            left={props => <Avatar.Icon {...props} icon="heart" />}
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
            {t('onboarding.choose-habits')}
          </Button>
        </View>
      </View>
    );
  } else if (step === 2) {
    const habitIcons = [
      'alarm',
      'water',
      'dumbbell',
      'food-apple',
      'book-open',
      'school',
      'meditation',
      'broom',
    ];

    return (
      <View style={styles.container}>
        <View style={styles.onboarding__bar}>
          <Text variant="headlineMedium">{t('onboarding.choose')}</Text>
          <Text variant="bodyLarge">{t('onboarding.which-habits')}</Text>
        </View>

        <ScrollView style={styles.container}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(habitId => (
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
                    {t(`default-habits.${habitId}.goodChoice`)} vs{' '}
                    {t(`default-habits.${habitId}.badChoice`)}
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
            {t('onboarding.read-intro')}
          </Button>
        </View>
      </View>
    );
  } else if (step === 3) {
    return (
      <View style={styles.container__center}>
        <View style={styles.onboarding__bar}>
          <Text variant="headlineMedium">{t('onboarding.great')}</Text>
          <Text variant="bodyLarge">{t('onboarding.you-know')}</Text>
        </View>

        <Card style={styles.onboarding__card}>
          <Card.Content>
            <Text variant="bodyMedium" style={{textAlign: 'center'}}>
              {t('onboarding.how-to-start-1')}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.onboarding__card}>
          <Card.Content>
            <Text variant="bodyMedium" style={{textAlign: 'center'}}>
              {t('onboarding.how-to-start-2')}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.onboarding__card}>
          <Card.Content>
            <Text variant="bodyMedium" style={{textAlign: 'center'}}>
              {t('onboarding.how-to-start-3')}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.onboarding__bar}>
          <Button
            style={styles.button}
            mode="contained"
            onPress={() => {
              handleStep3();
            }}>
            {t('onboarding.start')}
          </Button>
        </View>
      </View>
    );
  }
};

export default OnboardingView;
