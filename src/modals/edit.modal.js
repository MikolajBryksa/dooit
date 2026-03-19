import React, {useState, useEffect, useRef} from 'react';
import {Button, TextInput, Card} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {
  updateHabitValue,
  updateHabitValues,
  getHabitById,
  getSuggestedGoalFromSchedule,
} from '@/services/habits.service';
import {hourToSec} from '@/utils';
import DaysSelector from '@/selectors/days.selector';
import HoursSelector from '@/selectors/hours.selector';
import IconSelector from '@/selectors/icon.selector';
import {logError} from '@/services/errors.service.js';
import ModalComponent from '@/components/modal.component';
import ChangeGoalDialog from '@/dialogs/change-goal.dialog';

const EditModal = ({
  visible,
  onDismiss,
  field,
  value,
  label,
  habitId,
  fetchAllHabits,
  keyboardType = 'default',
  onboardingMode = false,
}) => {
  const {t} = useTranslation();
  const hoursResetRef = useRef(null);

  const getDefaultValueForField = currentField => {
    if (currentField === 'repeatDays' || currentField === 'repeatHours') {
      return [];
    }

    if (currentField === 'habitName' || currentField === 'goal') {
      return '';
    }

    return '';
  };

  const getDefaultIcon = () => 'infinity';

  const normalizeArray = val => {
    if (Array.isArray(val)) return val;
    if (val == null || val === '') return [];
    return [val];
  };

  const [inputValue, setInputValue] = useState(
    field === 'repeatDays' || field === 'repeatHours'
      ? normalizeArray(value)
      : value,
  );
  const [selectedIcon, setSelectedIcon] = useState('infinity');

  const [changeGoalVisible, setChangeGoalVisible] = useState(false);
  const [pendingGoal, setPendingGoal] = useState(null);
  const [currentGoal, setCurrentGoal] = useState(null);

  useEffect(() => {
    if (field === 'repeatDays' || field === 'repeatHours') {
      setInputValue(normalizeArray(value));
    } else {
      setInputValue(value);
    }

    if (habitId) {
      const habit = getHabitById(habitId);

      if (field === 'habitName' && habit?.icon) {
        setSelectedIcon(habit.icon);
      }

      if (habit?.goal != null) {
        setCurrentGoal(habit.goal);
      }
    }

    setChangeGoalVisible(false);
    setPendingGoal(null);
  }, [value, field, habitId]);

  const closeModal = () => {
    fetchAllHabits();

    setTimeout(() => {
      onDismiss();
    }, 100);
  };

  const handleSave = async () => {
    let valueToSave = inputValue;

    if (field === 'goal') {
      const parsed = parseInt(inputValue, 10);
      valueToSave = isNaN(parsed) ? 1 : Math.max(1, Math.min(parsed, 999));
    }

    if (field === 'repeatHours' && Array.isArray(valueToSave)) {
      valueToSave = [...valueToSave].sort(
        (a, b) => hourToSec(a) - hourToSec(b),
      );
    }

    try {
      const habit = getHabitById(habitId);

      if (!habit) {
        closeModal();
        return;
      }

      if (field === 'habitName') {
        updateHabitValues(habitId, {
          habitName: valueToSave,
          icon: selectedIcon || habit.icon || 'infinity',
        });

        closeModal();
        return;
      }

      if (field === 'repeatDays' || field === 'repeatHours') {
        const nextRepeatDays =
          field === 'repeatDays' ? valueToSave : habit.repeatDays;
        const nextRepeatHours =
          field === 'repeatHours' ? valueToSave : habit.repeatHours;

        const suggestedGoal = getSuggestedGoalFromSchedule(
          nextRepeatDays,
          nextRepeatHours,
        );

        const existingGoal = habit.goal || 0;

        if (onboardingMode) {
          const updates = {
            [field]: valueToSave,
          };

          if (suggestedGoal > 0 && suggestedGoal !== existingGoal) {
            updates.goal = suggestedGoal;
          }

          updateHabitValues(habitId, updates);
          closeModal();
          return;
        }

        updateHabitValue(habitId, field, valueToSave);

        if (suggestedGoal > 0 && suggestedGoal !== existingGoal) {
          setCurrentGoal(existingGoal);
          setPendingGoal(suggestedGoal);
          setChangeGoalVisible(true);
          return;
        }

        closeModal();
        return;
      }

      updateHabitValue(habitId, field, valueToSave);
      closeModal();
    } catch (error) {
      logError(error, 'EditModal.handleSave');
      onDismiss();
    }
  };

  const handleConfirmGoalChange = () => {
    try {
      if (pendingGoal != null) {
        updateHabitValue(habitId, 'goal', pendingGoal);
      }

      setChangeGoalVisible(false);
      setPendingGoal(null);
      closeModal();
    } catch (error) {
      logError(error, 'EditModal.handleConfirmGoalChange');
      onDismiss();
    }
  };

  const handleDismissGoalChange = () => {
    setChangeGoalVisible(false);
    setPendingGoal(null);
    closeModal();
  };

  const handleReset = () => {
    setInputValue(getDefaultValueForField(field));

    if (field === 'habitName') {
      setSelectedIcon(getDefaultIcon());
    }

    if (field === 'repeatHours' && hoursResetRef.current) {
      hoursResetRef.current();
    }
  };

  const isEmptyArray = Array.isArray(inputValue) && inputValue.length === 0;

  const isEmptyText =
    !Array.isArray(inputValue) &&
    (inputValue === null ||
      inputValue === undefined ||
      inputValue.toString().trim().length === 0);

  const isSaveDisabled = isEmptyArray || isEmptyText;

  return (
    <>
      <ModalComponent
        visible={visible}
        onDismiss={onDismiss}
        title={label || t(`card.${field}`)}>
        <Card.Content>
          {field === 'repeatDays' && (
            <DaysSelector
              repeatDays={inputValue}
              setRepeatDays={setInputValue}
            />
          )}

          {field === 'repeatHours' && (
            <HoursSelector
              repeatHours={inputValue}
              setRepeatHours={setInputValue}
              onResetRef={hoursResetRef}
            />
          )}

          {field === 'goal' && (
            <TextInput
              mode="outlined"
              value={inputValue?.toString() ?? ''}
              onChangeText={text => setInputValue(text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              autoFocus
              style={{marginBottom: 16}}
              maxLength={3}
            />
          )}

          {field === 'habitName' && (
            <>
              <TextInput
                mode="outlined"
                value={inputValue?.toString() ?? ''}
                onChangeText={setInputValue}
                keyboardType={keyboardType}
                autoFocus
                style={{marginBottom: 16}}
                maxLength={60}
              />

              <IconSelector
                selectedIcon={selectedIcon}
                setSelectedIcon={setSelectedIcon}
              />
            </>
          )}

          <Card.Actions>
            <Button mode="outlined" onPress={handleReset} icon="refresh">
              {t('button.reset')}
            </Button>

            <Button
              mode="contained"
              onPress={handleSave}
              icon={isSaveDisabled ? 'lock' : 'check'}
              disabled={isSaveDisabled}>
              {t('button.save')}
            </Button>
          </Card.Actions>
        </Card.Content>
      </ModalComponent>

      <ChangeGoalDialog
        visible={changeGoalVisible}
        onDismiss={handleDismissGoalChange}
        onConfirm={handleConfirmGoalChange}
        currentGoal={currentGoal}
        suggestedGoal={pendingGoal}
      />
    </>
  );
};

export default EditModal;
