import React, {useEffect} from 'react';
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
import {styles} from '../styles';
import ProgressTypeEnum from '../enum/progressType.enum';
import {useTranslation} from 'react-i18next';

const SetHabitModal = ({
  visible,
  onDismiss,
  habitName,
  progressType,
  progressUnit,
  textInput,
  setTextInput,
  handleSet,
}) => {
  const {t} = useTranslation();
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
          <TextInput
            mode="outlined"
            label={
              progressType === ProgressTypeEnum.TIME
                ? t('unit.minutes')
                : progressUnit
            }
            value={textInput}
            keyboardType="numeric"
            onChangeText={text => {
              const numericValue = text.replace(/[^0-9.]/g, '');
              setTextInput(numericValue);
            }}
          />
        </Card.Content>
        <Card.Actions>
          <Button
            onPress={() => {
              handleSet(parseFloat(textInput));
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
