import React from 'react';
import {Dialog, Portal, Button, Text} from 'react-native-paper';
import {updateHabitValues} from '@/services/habits.service';
import {useTranslation} from 'react-i18next';

const EqualizeDialog = ({
  visible,
  onDismiss,
  onDone,
  habitId,
  goodCounter,
  badCounter,
}) => {
  const {t} = useTranslation();

  const handleEqualize = () => {
    let newGood = goodCounter;
    let newBad = badCounter;

    if (goodCounter > badCounter) {
      newGood = goodCounter - badCounter;
      newBad = 0;
    } else if (badCounter > goodCounter) {
      newBad = badCounter - goodCounter;
      newGood = 0;
    } else {
      newGood = 0;
      newBad = 0;
    }

    updateHabitValues(habitId, {
      goodCounter: newGood,
      badCounter: newBad,
      skipCounter: 0,
    });
    onDone();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t('title.equalize')}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{t('message.equalize')}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('button.cancel')}</Button>
          <Button onPress={handleEqualize}>{t('button.equalize')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default EqualizeDialog;
