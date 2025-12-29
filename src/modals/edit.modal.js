import React, {useState, useEffect, useRef} from 'react';
import {
  Modal,
  Text,
  Button,
  TextInput,
  Card,
  IconButton,
} from 'react-native-paper';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {updateHabitValue, getHabitById} from '@/services/habits.service';
import {hourToSec} from '@/utils';
import DaysSelector from '@/selectors/days.selector';
import HoursSelector from '@/selectors/hours.selector';
import IconSelector from '@/selectors/icon.selector';
import {logError} from '@/services/error-tracking.service.js';

const EditModal = ({
  visible,
  onDismiss,
  field,
  value,
  label,
  habitId,
  fetchAllHabits,
  keyboardType = 'default',
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const hoursResetRef = useRef(null);

  const getDefaultValueForField = currentField => {
    if (currentField === 'repeatDays' || currentField === 'repeatHours')
      return [];
    if (currentField === 'habitName' || currentField === 'habitEnemy')
      return '';
    if (['goodCounter', 'badCounter', 'skipCounter'].includes(currentField))
      return '';
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

  useEffect(() => {
    if (field === 'repeatDays' || field === 'repeatHours') {
      setInputValue(normalizeArray(value));
    } else {
      setInputValue(value);
    }

    if (field === 'habitName' && habitId) {
      const habit = getHabitById(habitId);
      if (habit && habit.icon) {
        setSelectedIcon(habit.icon);
      }
    }
  }, [value, field, habitId]);

  const handleSave = async () => {
    let valueToSave = inputValue;
    const numericFields = ['goodCounter', 'badCounter', 'skipCounter'];
    if (numericFields.includes(field)) {
      const parsed = parseInt(inputValue, 10);
      valueToSave = isNaN(parsed) ? 0 : parsed;
    }

    if (field === 'repeatHours' && Array.isArray(valueToSave)) {
      valueToSave = [...valueToSave].sort(
        (a, b) => hourToSec(a) - hourToSec(b),
      );
    }

    try {
      updateHabitValue(habitId, field, valueToSave);

      if (field === 'habitName' && selectedIcon) {
        updateHabitValue(habitId, 'icon', selectedIcon);
      }

      fetchAllHabits();
      setTimeout(() => {
        onDismiss();
      }, 100);
    } catch (error) {
      logError(error, 'handleSave');
      onDismiss();
    }
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

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.modal}>
      <Card.Content>
        <View style={styles.modal__title}>
          <Text variant="titleMedium">{label || t(`card.${field}`)}</Text>
          <IconButton icon="close" size={20} onPress={onDismiss} />
        </View>

        {field === 'repeatDays' && (
          <DaysSelector repeatDays={inputValue} setRepeatDays={setInputValue} />
        )}

        {field === 'repeatHours' && (
          <HoursSelector
            repeatHours={inputValue}
            setRepeatHours={setInputValue}
            onResetRef={hoursResetRef}
          />
        )}

        {['goodCounter', 'badCounter'].includes(field) && (
          <TextInput
            mode="outlined"
            value={inputValue === 0 ? '' : inputValue?.toString()}
            onChangeText={text => setInputValue(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            autoFocus
            style={{marginBottom: 16}}
            maxLength={5}
          />
        )}

        {['habitName', 'habitEnemy'].includes(field) && (
          <>
            <TextInput
              mode="outlined"
              value={inputValue?.toString()}
              onChangeText={setInputValue}
              keyboardType={keyboardType}
              autoFocus={field === 'habitEnemy'}
              style={{marginBottom: 16}}
              maxLength={60}
            />
            {field === 'habitName' && (
              <IconSelector
                selectedIcon={selectedIcon}
                setSelectedIcon={setSelectedIcon}
              />
            )}
          </>
        )}
        <Card.Actions>
          <Button mode="outlined" onPress={handleReset} icon="refresh">
            {t('button.reset')}
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            icon={!inputValue || inputValue.length === 0 ? 'lock' : 'check'}
            disabled={!inputValue || inputValue.length === 0}>
            {t('button.save')}
          </Button>
        </Card.Actions>
      </Card.Content>
    </Modal>
  );
};

export default EditModal;
