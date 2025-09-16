import React from 'react';
import {Dialog, Portal, Button, Text} from 'react-native-paper';
import {updateHabitValues, getHabits} from '@/services/habits.service';
import {useTranslation} from 'react-i18next';

const EqualizeDialog = ({visible, onDismiss, onDone}) => {
  const {t} = useTranslation();

  const handleEqualize = () => {
    const habits = getHabits() || [];
    habits.forEach(habit => {
      let newGood = habit.goodCounter;
      let newBad = habit.badCounter;

      if (habit.goodCounter > habit.badCounter) {
        newGood = habit.goodCounter - habit.badCounter;
        newBad = 0;
      } else if (habit.badCounter > habit.goodCounter) {
        newBad = habit.badCounter - habit.goodCounter;
        newGood = 0;
      } else {
        newGood = 0;
        newBad = 0;
      }

      updateHabitValues(habit.id, {
        goodCounter: newGood,
        badCounter: newBad,
        skipCounter: 0,
      });
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
