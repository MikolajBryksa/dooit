import React, {useState, useEffect, useCallback} from 'react';
import {useSelector} from 'react-redux';
import {View} from 'react-native';
import {
  Card,
  Button,
  Text,
  Divider,
  Modal,
  TextInput,
  Portal,
  RadioButton,
  ProgressBar,
  IconButton,
} from 'react-native-paper';
import ProgressTypeEnum from '../enum/progressType.enum';
import {TimePicker} from 'react-native-paper-dates';
import {addHabit, updateHabit} from '../services/habits.service';
import {useTranslation} from 'react-i18next';
import {useStyles} from '../styles';
import DaysSelector from '../components/daysSelector';

const AddHabitModal = ({
  visible,
  onDismiss,
  fetchHabitsWithProgress,
  currentHabit,
}) => {
  const settings = useSelector(state => state.settings);
  const [step, setStep] = useState(1);
  const [value, setValue] = useState('');
  const [progressBarValue, setProgressBarValue] = useState(0);
  const [showExamples, setShowExamples] = useState(false);
  const [id, setId] = useState(null);
  const {t} = useTranslation();
  const styles = useStyles();

  const [habitName, setHabitName] = useState('');
  const habitNameOptions = [
    t('option.habit-name.water'),
    t('option.habit-name.book'),
    t('option.habit-name.workout'),
  ];

  const [firstStep, setFirstStep] = useState('');
  const firstStepOptions = [
    t('option.first-step.water'),
    t('option.first-step.book'),
    t('option.first-step.workout'),
  ];

  const [goalDesc, setGoalDesc] = useState('');
  const goalDescOptions = [
    t('option.goal-desc.water'),
    t('option.goal-desc.book'),
    t('option.goal-desc.workout'),
  ];

  const [motivation, setMotivation] = useState('');
  const motivationOptions = [
    t('option.motivation.water'),
    t('option.motivation.book'),
    t('option.motivation.workout'),
  ];

  const [repeatDays, setRepeatDays] = useState([]);
  const [habitStart, setHabitStart] = useState('');
  const [progressType, setProgressType] = useState('');
  const [targetScore, setTargetScore] = useState(0);

  const [progressUnit, setProgressUnit] = useState('');
  const progressUnitOptions = [
    t('option.progress-unit.water'),
    t('option.progress-unit.book'),
    t('option.progress-unit.workout'),
  ];

  const handleInput = (value, field) => {
    setValue(value);
    if (step === 1) setHabitName(value);
    if (step === 2) setFirstStep(value);
    if (step === 3) setGoalDesc(value);
    if (step === 4) setMotivation(value);
    if (step === 7) setProgressType(value);
    if (step === 8 && field === 'targetScore') setTargetScore(value);
    if (step === 8 && field === 'progressUnit') setProgressUnit(value);
  };

  const parseTime = timeString => {
    const date = new Date(`1970-01-01T${timeString}`);
    if (isNaN(date.getTime())) {
      const [time, modifier] = timeString.split(' ');
      let [hours, minutes] = time.split(':');
      if (modifier === 'PM' && hours !== '12') {
        hours = parseInt(hours, 10) + 12;
      }
      if (modifier === 'AM' && hours === '12') {
        hours = 0;
      }
      return {
        hours: parseInt(hours, 10),
        minutes: parseInt(minutes, 10),
      };
    }
    return {
      hours: date.getHours(),
      minutes: date.getMinutes(),
    };
  };

  const setCurrentHabit = () => {
    setId(currentHabit.id);
    setHabitName(currentHabit.habitName);
    setFirstStep(currentHabit.firstStep);
    setGoalDesc(currentHabit.goalDesc);
    setMotivation(currentHabit.motivation);
    setRepeatDays(
      Array.isArray(currentHabit.repeatDays)
        ? currentHabit.repeatDays
        : JSON.parse(currentHabit.repeatDays),
    );
    const {hours, minutes} = parseTime(currentHabit.habitStart);
    setHours(hours);
    setMinutes(minutes);
    setHabitStart(currentHabit.habitStart);
    setProgressType(currentHabit.progressType);
    setProgressUnit(currentHabit.progressUnit);
    if (currentHabit.progressType === ProgressTypeEnum.TIME) {
      setTargetScore(currentHabit.targetScore / 60);
    } else {
      setTargetScore(currentHabit.targetScore);
    }
  };

  useEffect(() => {
    if (currentHabit) {
      setCurrentHabit();
    }
  }, [currentHabit]);

  const resetInputs = () => {
    setHabitName('');
    setFirstStep('');
    setGoalDesc('');
    setMotivation('');
    setRepeatDays([]);
    setHabitStart('');
    setProgressType('');
    setProgressUnit('');
    setTargetScore(0);
    setValue('');
    setShowExamples(false);
    setTimeout(() => {
      setStep(1);
    }, 500);
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleExamples = () => {
    setShowExamples(!showExamples);
  };

  useEffect(() => {
    setShowExamples(false);
  }, [step]);

  const handleSave = async () => {
    try {
      const finalTargetScore =
        progressType === ProgressTypeEnum.TIME
          ? parseFloat(targetScore) * 60
          : parseFloat(targetScore);

      addHabit(
        habitName,
        firstStep,
        goalDesc,
        motivation,
        repeatDays,
        habitStart,
        progressType,
        progressUnit,
        finalTargetScore,
      );
      fetchHabitsWithProgress();
      onDismiss();
      setTimeout(() => {
        resetInputs();
      }, 500);
    } catch (error) {
      console.error('Error adding habit:', error.message);
    }
  };

  const handleUpdate = async () => {
    try {
      const finalTargetScore =
        progressType === ProgressTypeEnum.TIME
          ? parseFloat(targetScore) * 60
          : parseFloat(targetScore);

      updateHabit(
        id,
        habitName,
        firstStep,
        goalDesc,
        motivation,
        repeatDays,
        habitStart,
        progressType,
        progressUnit,
        finalTargetScore,
      );
      fetchHabitsWithProgress();
      onDismiss();
      setTimeout(() => {
        resetInputs();
      }, 500);
    } catch (error) {
      console.error('Error updating habit:', error.message);
    }
  };

  function getMinutes(minutes) {
    return minutes === undefined || minutes === null
      ? new Date().getMinutes()
      : minutes;
  }

  function getHours(hours) {
    return hours === undefined || hours === null
      ? new Date().getHours()
      : hours;
  }

  const [hours, setHours] = useState(getHours(hours));
  const [minutes, setMinutes] = useState(getMinutes(minutes));
  const [focused, setFocused] = useState('hours');

  useEffect(() => {
    setHours(getHours(hours));
  }, [setHours, hours]);

  useEffect(() => {
    setMinutes(getMinutes(minutes));
  }, [setMinutes, minutes]);

  const onFocusInput = useCallback(type => setFocused(type), []);

  const formatTime = (hours, minutes) => {
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const onChange = useCallback(
    params => {
      if (params.focused) {
        setFocused(params.focused);
      }
      setHours(params.hours);
      setMinutes(params.minutes);
      setHabitStart(formatTime(params.hours, params.minutes));
    },
    [setFocused, setHours, setMinutes],
  );

  useEffect(() => {
    let progress = 0;
    if (progressType === ProgressTypeEnum.DONE) {
      progress = step / 7;
    } else {
      progress = step / 8;
    }
    setProgressBarValue(progress);
    if (step === 1) {
      setHours(getHours());
      setMinutes(getMinutes());
      setFocused('hours');
    }
  }, [step, progressType]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}>
        <Card.Content>
          <View style={styles.title}>
            <Text variant="titleLarge">
              {currentHabit ? t('title.edit-habit') : t('title.add-habit')}
            </Text>
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
              <Text variant="bodyMedium">{t('step.1')}?</Text>
              <Divider style={styles.divider} />
              <TextInput
                mode="outlined"
                label={t('input.habit-name')}
                value={habitName}
                onChangeText={value => handleInput(value)}
              />
              {!currentHabit && showExamples && (
                <RadioButton.Group
                  onValueChange={value => {
                    handleInput(value);
                  }}
                  value={value}>
                  {habitNameOptions.map(option => (
                    <RadioButton.Item
                      key={option}
                      label={option}
                      value={option}
                    />
                  ))}
                </RadioButton.Group>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <Text variant="bodyMedium">{t('step.2')}?</Text>
              <Divider style={styles.divider} />
              <TextInput
                mode="outlined"
                label={t('input.first-step')}
                value={firstStep}
                onChangeText={value => handleInput(value)}
              />
              {!currentHabit && showExamples && (
                <RadioButton.Group
                  onValueChange={value => {
                    handleInput(value);
                  }}
                  value={value}>
                  {firstStepOptions.map(option => (
                    <RadioButton.Item
                      key={option}
                      label={option}
                      value={option}
                    />
                  ))}
                </RadioButton.Group>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <Text variant="bodyMedium">{t('step.3')}?</Text>
              <Divider style={styles.divider} />
              <TextInput
                mode="outlined"
                label={t('input.goal-desc')}
                value={goalDesc}
                onChangeText={value => handleInput(value)}
              />
              {!currentHabit && showExamples && (
                <RadioButton.Group
                  onValueChange={value => {
                    handleInput(value);
                  }}
                  value={value}>
                  {goalDescOptions.map(option => (
                    <RadioButton.Item
                      key={option}
                      label={option}
                      value={option}
                    />
                  ))}
                </RadioButton.Group>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <Text variant="bodyMedium">{t('step.4')}?</Text>
              <Divider style={styles.divider} />
              <TextInput
                mode="outlined"
                label={t('input.motivation')}
                value={motivation}
                onChangeText={value => handleInput(value)}
              />
              {!currentHabit && showExamples && (
                <RadioButton.Group
                  onValueChange={value => {
                    handleInput(value);
                  }}
                  value={value}>
                  {motivationOptions.map(option => (
                    <RadioButton.Item
                      key={option}
                      label={option}
                      value={option}
                    />
                  ))}
                </RadioButton.Group>
              )}
            </>
          )}

          {step === 5 && (
            <>
              <Text variant="bodyMedium">{t('step.5')}?</Text>
              <Divider style={styles.divider} />
              <DaysSelector
                repeatDays={repeatDays}
                setRepeatDays={setRepeatDays}
              />
            </>
          )}

          {step === 6 && (
            <>
              <Text variant="bodyMedium">{t('step.6')}?</Text>
              <Divider style={styles.divider} />
              <TimePicker
                inputType={'picker'}
                use24HourClock={settings.clockFormat === '24h' ? true : false}
                focused={focused}
                hours={hours}
                minutes={minutes}
                onChange={onChange}
                onFocusInput={onFocusInput}
              />
            </>
          )}

          {step === 7 && (
            <>
              <Text variant="bodyMedium">{t('step.7')}?</Text>
              <Divider style={styles.divider} />
              <View style={!!currentHabit && styles.disabled}>
                <RadioButton.Group
                  onValueChange={value => {
                    handleInput(value);
                  }}
                  value={progressType}>
                  <RadioButton.Item
                    label={t('input.progress-type.time')}
                    value={ProgressTypeEnum.TIME}
                    disabled={!!currentHabit}
                  />
                  <RadioButton.Item
                    label={t('input.progress-type.amount')}
                    value={ProgressTypeEnum.AMOUNT}
                    disabled={!!currentHabit}
                  />
                  <RadioButton.Item
                    label={t('input.progress-type.value')}
                    value={ProgressTypeEnum.VALUE}
                    disabled={!!currentHabit}
                  />
                  <RadioButton.Item
                    label={t('input.progress-type.done')}
                    value={ProgressTypeEnum.DONE}
                    disabled={!!currentHabit}
                  />
                </RadioButton.Group>
              </View>
            </>
          )}

          {step === 8 && (
            <>
              <Text variant="bodyMedium">{t('step.8')}?</Text>
              <Divider style={styles.divider} />
              <View style={styles.targetScore}>
                <TextInput
                  style={styles.input}
                  mode="outlined"
                  label={t('input.target-score')}
                  value={targetScore.toString()}
                  keyboardType="numeric"
                  onChangeText={text => {
                    const sanitizedText = text.replace(',', '.');
                    const numericValue = sanitizedText.replace(/[^0-9.]/g, '');
                    handleInput(numericValue, 'targetScore');
                  }}
                />
                {progressType === ProgressTypeEnum.AMOUNT ||
                progressType === ProgressTypeEnum.VALUE ? (
                  <>
                    <TextInput
                      style={styles.input}
                      mode="outlined"
                      label={t('input.progress-unit')}
                      value={progressUnit}
                      onChangeText={value => setProgressUnit(value)}
                    />
                  </>
                ) : (
                  <TextInput
                    style={[styles.input, styles.disabled]}
                    mode="outlined"
                    label={t('input.progress-unit')}
                    value={t('input.minutes')}
                    disabled
                  />
                )}
              </View>
              {!currentHabit &&
                showExamples &&
                progressType !== ProgressTypeEnum.TIME && (
                  <RadioButton.Group
                    onValueChange={value => {
                      handleInput(value, 'progressUnit');
                    }}
                    value={value}>
                    {progressUnitOptions.map(option => (
                      <RadioButton.Item
                        key={option}
                        label={option}
                        value={option}
                      />
                    ))}
                  </RadioButton.Group>
                )}
            </>
          )}
        </Card.Content>

        <View style={styles.gap} />

        <Card.Actions>
          {step > 1 && (
            <Button mode="outlined" onPress={handlePrevStep}>
              {t('button.back')}
            </Button>
          )}
          {step !== 5 && step !== 6 && step !== 7 && (
            <Button mode="outlined" onPress={handleExamples}>
              {t('button.examples')}
            </Button>
          )}
          {currentHabit && <Button onPress={handleUpdate}>Zapisz</Button>}
          {step < 8 && (
            <Button
              onPress={handleNextStep}
              disabled={
                (step === 1 && !habitName) ||
                (step === 2 && !firstStep) ||
                (step === 3 && !goalDesc) ||
                (step === 4 && !motivation) ||
                (step === 5 && repeatDays.length === 0) ||
                (step === 6 && !habitStart) ||
                (step === 7 && !progressType)
              }>
              {t('button.next')}
            </Button>
          )}

          {step === 7 &&
            progressType === ProgressTypeEnum.DONE &&
            !currentHabit && (
              <Button onPress={handleSave}>{t('button.save')}</Button>
            )}

          {step === 8 && !currentHabit && (
            <Button
              onPress={handleSave}
              disabled={
                progressType !== ProgressTypeEnum.DONE &&
                progressType !== ProgressTypeEnum.TIME
                  ? !progressUnit || !targetScore
                  : !targetScore
              }>
              {t('button.save')}
            </Button>
          )}
        </Card.Actions>
      </Modal>
    </Portal>
  );
};

export default AddHabitModal;
