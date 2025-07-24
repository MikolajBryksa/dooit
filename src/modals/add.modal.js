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
  const [goodChoice, setGoodChoice] = useState('');
  const [badChoice, setBadChoice] = useState('');
  const [repeatDays, setRepeatDays] = useState([]);
  const [repeatHours, setRepeatHours] = useState([]);

  const maxSteps = 5;

  const resetInputs = () => {
    setHabitName('');
    setGoodChoice('');
    setBadChoice('');
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
      addHabit(habitName, goodChoice, badChoice, repeatDays, repeatHours);
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
        return goodChoice.trim() !== '';
      case 3:
        return badChoice.trim() !== '';
      case 4:
        return repeatDays.length > 0;
      case 5:
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
              <Text variant="bodyMedium">{t('step.habit-name')}</Text>
              <TextInput
                mode="outlined"
                label={t('input.habit-name')}
                value={habitName}
                onChangeText={setHabitName}
              />
            </>
          )}

          {step === 2 && (
            <>
              <Text variant="bodyMedium">{t('step.good-choice')}</Text>
              <TextInput
                mode="outlined"
                label={t('input.good-choice')}
                value={goodChoice}
                onChangeText={setGoodChoice}
              />
            </>
          )}

          {step === 3 && (
            <>
              <Text variant="bodyMedium">{t('step.bad-choice')}</Text>
              <TextInput
                mode="outlined"
                label={t('input.bad-choice')}
                value={badChoice}
                onChangeText={setBadChoice}
              />
            </>
          )}

          {step === 4 && (
            <>
              <Text variant="bodyMedium">{t('step.repeat-days')}</Text>
              <DaysSelector
                repeatDays={repeatDays}
                setRepeatDays={setRepeatDays}
              />
            </>
          )}

          {step === 5 && (
            <>
              <Text variant="bodyMedium">{t('step.repeat-hours')}</Text>
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
