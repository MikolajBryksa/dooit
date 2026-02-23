import React, {useEffect, useState, useRef} from 'react';
import {View} from 'react-native';
import {Card, Button, Text, TextInput, ProgressBar} from 'react-native-paper';
import {addHabit} from '@/services/habits.service';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import DaysSelector from '@/selectors/days.selector';
import HoursSelector from '@/selectors/hours.selector';
import IconSelector from '@/selectors/icon.selector';
import {logError} from '@/services/errors.service.js';
import ModalComponent from '@/components/modal.component';

const AddModal = ({visible, onDismiss, fetchAllHabits}) => {
  const {t} = useTranslation();
  const styles = useStyles();

  const [step, setStep] = useState(1);
  const [progressBarValue, setProgressBarValue] = useState(0);

  const [habitName, setHabitName] = useState('');
  const [repeatDays, setRepeatDays] = useState([]);
  const [repeatHours, setRepeatHours] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState('infinity');

  const maxSteps = 3;

  const resetInputs = () => {
    setHabitName('');
    setRepeatDays([]);
    setRepeatHours([]);
    setSelectedIcon('infinity');
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
      addHabit(habitName, repeatDays, repeatHours, selectedIcon);
      fetchAllHabits();
      onDismiss();
      setTimeout(() => {
        resetInputs();
      }, 500);
    } catch (error) {
      logError(error, 'handleSave');
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
        return repeatDays.length > 0;
      case 3:
        return repeatHours.length > 0;
      default:
        return false;
    }
  };

  return (
    <ModalComponent
      visible={visible}
      onDismiss={onDismiss}
      title={t('title.add')}
      onClose={() => {
        onDismiss();
        resetInputs();
      }}>
      <Card.Content>
        <ProgressBar style={styles.progress__bar} progress={progressBarValue} />

        {step === 1 && (
          <>
            <Text variant="bodyMedium">{t('addStep.habitName')}</Text>
            <TextInput
              mode="outlined"
              placeholder={t('card.habitName')}
              value={habitName}
              onChangeText={setHabitName}
              maxLength={60}
              style={{marginBottom: 16}}
            />
            <IconSelector
              selectedIcon={selectedIcon}
              setSelectedIcon={setSelectedIcon}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Text variant="bodyMedium">{t('addStep.repeatDays')}</Text>
            <DaysSelector
              repeatDays={repeatDays}
              setRepeatDays={setRepeatDays}
            />
          </>
        )}

        {step === 3 && (
          <>
            <Text variant="bodyMedium">{t('addStep.repeatHours')}</Text>
            <View style={styles.gap} />
            <HoursSelector
              repeatHours={repeatHours}
              setRepeatHours={setRepeatHours}
            />
          </>
        )}

        <View style={styles.gap} />

        <Card.Actions>
          {step > 1 && (
            <Button mode="outlined" onPress={handlePrevStep} icon="arrow-left">
              {t('button.back')}
            </Button>
          )}

          {step < maxSteps && (
            <Button
              onPress={handleNextStep}
              disabled={!canProceed()}
              icon="arrow-right">
              {t('button.next')}
            </Button>
          )}

          {step === maxSteps && (
            <Button onPress={handleSave} disabled={!canProceed()} icon="check">
              {t('button.save')}
            </Button>
          )}
        </Card.Actions>
      </Card.Content>
    </ModalComponent>
  );
};

export default AddModal;
