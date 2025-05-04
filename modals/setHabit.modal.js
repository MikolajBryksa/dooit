import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {
  Card,
  Button,
  Text,
  Divider,
  Modal,
  TextInput,
  Portal,
  IconButton,
} from 'react-native-paper';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '../styles';
import ProgressTypeEnum from '../enum/progressType.enum';

const SetHabitModal = ({
  visible,
  onDismiss,
  habitName,
  progressType,
  progressUnit,
  textInput,
  setTextInput,
  handleSet,
  handleDelete,
  selectedProgress,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const [addedValue, setAddedValue] = useState(0);
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}>
        <Card.Content>
          <View style={styles.title}>
            <Text variant="titleLarge">{habitName}</Text>
            <IconButton icon="close" size={20} onPress={onDismiss} />
          </View>

          <Divider style={styles.divider} />
          {selectedProgress && (
            <>
              <Text variant="bodyMedium">
                {new Date(selectedProgress.date).toLocaleDateString('pl-PL')}
              </Text>
              <View style={styles.gap} />
            </>
          )}

          {progressType !== ProgressTypeEnum.DONE && (
            <View style={styles.targetScore}>
              <TextInput
                style={styles.input}
                mode="outlined"
                label={
                  progressType === ProgressTypeEnum.TIME
                    ? t('unit.minutes')
                    : progressUnit
                }
                value={textInput}
                keyboardType="numeric"
                onChangeText={text => {
                  const sanitizedText = text.replace(',', '.');
                  const numericValue = sanitizedText.replace(/[^0-9.]/g, '');
                  setTextInput(numericValue);
                }}
              />
              <Text style={{alignSelf: 'center'}}>+</Text>
              <TextInput
                style={styles.input}
                mode="outlined"
                label={
                  progressType === ProgressTypeEnum.TIME
                    ? t('unit.minutes')
                    : progressUnit
                }
                value={addedValue}
                keyboardType="numeric"
                onChangeText={text => {
                  const sanitizedText = text.replace(',', '.');
                  const numericValue = sanitizedText.replace(/[^0-9.]/g, '');
                  setAddedValue(numericValue);
                }}
              />
            </View>
          )}
        </Card.Content>
        <View style={styles.gap} />
        <Card.Actions>
          <Button
            onPress={() => {
              handleDelete();
            }}
            mode="outlined">
            {t('button.delete')}
          </Button>
          <Button
            onPress={() => {
              const baseValue = parseFloat(textInput) || 0;
              const additionalValue = parseFloat(addedValue) || 0;
              handleSet(baseValue + additionalValue);
            }}
            mode="contained">
            {t('button.save')}
          </Button>
        </Card.Actions>
      </Modal>
    </Portal>
  );
};

export default SetHabitModal;
