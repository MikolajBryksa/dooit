import React, {useState, useEffect} from 'react';
import {
  Modal,
  Portal,
  Text,
  Button,
  TextInput,
  Card,
  IconButton,
} from 'react-native-paper';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import DaysSelector from '@/components/days.selector';
import HoursSelector from '@/components/hours.selector';

const EditModal = ({
  visible,
  onDismiss,
  field,
  value,
  onSave,
  label,
  keyboardType = 'default',
}) => {
  const {t} = useTranslation();
  const styles = useStyles();

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

  const handleSave = () => {
    let valueToSave = inputValue;
    const numericFields = ['score', 'level', 'currentStreak'];
    if (numericFields.includes(field)) {
      const parsed = parseInt(inputValue, 10);
      valueToSave = isNaN(parsed) ? 0 : parsed;
    }
    onSave(valueToSave);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}>
        <Card.Content>
          <View style={styles.title}>
            <Text variant="titleMedium">{label || t(`card.${field}`)}</Text>
            <IconButton icon="close" size={20} onPress={onDismiss} />
          </View>

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
            />
          )}

          {field !== 'repeatDays' && field !== 'repeatHours' && (
            <TextInput
              mode="outlined"
              value={inputValue?.toString()}
              onChangeText={setInputValue}
              keyboardType={keyboardType}
              autoFocus
              style={{marginBottom: 16}}
              maxLength={
                ['score', 'level', 'currentStreak'].includes(field) ? 17 : 255
              }
            />
          )}
          <Card.Actions>
            <Button mode="contained" onPress={handleSave}>
              {t('button.save')}
            </Button>
          </Card.Actions>
        </Card.Content>
      </Modal>
    </Portal>
  );
};

export default EditModal;
