import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {
  Card,
  Button,
  Text,
  Modal,
  TextInput,
  Portal,
  ProgressBar,
  IconButton,
} from 'react-native-paper';
import {addHabit} from '@/services/habits.service';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import DaysSelector from '@/components/days.selector';
import HoursSelector from '@/components/hours.selector';

const AddModal = ({visible, onDismiss, fetchHabits}) => {
  const {t} = useTranslation();
  const styles = useStyles();

  const [step, setStep] = useState(1);
  const [progressBarValue, setProgressBarValue] = useState(0);

  const [habitName, setHabitName] = useState('');
  const [habitEnemy, setHabitEnemy] = useState('');
  const [repeatDays, setRepeatDays] = useState([]);
  const [repeatHours, setRepeatHours] = useState([]);

  const maxSteps = 4;

  const resetInputs = () => {
    setHabitName('');
    setHabitEnemy('');
    setRepeatDays([]);
    setRepeatHours([]);
    setStep(1);
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSave = async () => {
    try {
      addHabit(habitName, habitEnemy, repeatDays, repeatHours);
      fetchHabits();
      onDismiss();
      setTimeout(() => {
        resetInputs();
      }, 500);
    } catch (error) {
      console.error('Error adding habit:', error.message);
    }
  };

  useEffect(() => {
    setProgressBarValue(step / maxSteps);
  }, [step]);

  const canProceed = () => {
    switch (step) {
      case 1:
        return habitName.trim() !== '';
      case 2:
        return habitEnemy.trim() !== '';
      case 3:
        return repeatDays.length > 0;
      case 4:
        return repeatHours.length > 0;
      default:
        return false;
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}>
        <Card.Content>
          <View style={styles.title}>
            <Text variant="titleLarge">{t('title.add')}</Text>
            <IconButton
              icon="close"
              size={20}
              onPress={() => {
                onDismiss();
                resetInputs();
              }}
            />
          </View>
          <ProgressBar style={styles.progressBar} progress={progressBarValue} />

          {step === 1 && (
            <>
              <Text variant="bodyMedium">{t('addStep.habitName')}</Text>
              <TextInput
                mode="outlined"
                label={t('card.habitName')}
                value={habitName}
                onChangeText={setHabitName}
                maxLength={30}
              />
            </>
          )}

          {step === 2 && (
            <>
              <Text variant="bodyMedium">{t('addStep.habitEnemy')}</Text>
              <TextInput
                mode="outlined"
                label={t('card.habitEnemy')}
                value={habitEnemy}
                onChangeText={setHabitEnemy}
                maxLength={30}
              />
            </>
          )}

          {step === 3 && (
            <>
              <Text variant="bodyMedium">{t('addStep.repeatDays')}</Text>
              <DaysSelector
                repeatDays={repeatDays}
                setRepeatDays={setRepeatDays}
              />
            </>
          )}

          {step === 4 && (
            <>
              <Text variant="bodyMedium">{t('addStep.repeatHours')}</Text>
              <HoursSelector
                repeatHours={repeatHours}
                setRepeatHours={setRepeatHours}
              />
            </>
          )}

          <View style={styles.gap} />

          <Card.Actions>
            {step > 1 && (
              <Button mode="outlined" onPress={handlePrevStep}>
                {t('button.back')}
              </Button>
            )}

            {step < maxSteps && (
              <Button onPress={handleNextStep} disabled={!canProceed()}>
                {t('button.next')}
              </Button>
            )}

            {step === maxSteps && (
              <Button onPress={handleSave} disabled={!canProceed()}>
                {t('button.save')}
              </Button>
            )}
          </Card.Actions>
        </Card.Content>
      </Modal>
    </Portal>
  );
};

export default AddModal;
