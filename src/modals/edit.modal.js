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
import {updateHabitValue} from '@/services/habits.service';
import {hourToSec} from '@/utils';
import DaysSelector from '@/selectors/days.selector';
import HoursSelector from '@/selectors/hours.selector';

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

  useEffect(() => {
    if (field === 'repeatDays' || field === 'repeatHours') {
      setInputValue(normalizeArray(value));
    } else {
      setInputValue(value);
    }
  }, [value, field]);

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
      fetchAllHabits();
      setTimeout(() => {
        onDismiss();
      }, 100);
    } catch (error) {
      console.error('Error updating habit:', error);
      onDismiss();
    }
  };

  const handleReset = () => {
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
          <TextInput
            mode="outlined"
            value={inputValue?.toString()}
            onChangeText={setInputValue}
            keyboardType={keyboardType}
            autoFocus
            style={{marginBottom: 16}}
            maxLength={60}
          />
        )}
        <Card.Actions>
          {field === 'repeatHours' && (
            <Button mode="outlined" onPress={handleReset} icon="refresh">
              {t('button.reset')}
            </Button>
          )}
          <Button
            mode="contained"
            onPress={handleSave}
            icon={!inputValue ? 'lock' : 'check'}
            disabled={!inputValue || inputValue.length === 0}>
            {t('button.save')}
          </Button>
        </Card.Actions>
      </Card.Content>
    </Modal>
  );
};

export default EditModal;
