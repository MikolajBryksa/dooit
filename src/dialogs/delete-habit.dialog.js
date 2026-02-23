import React from 'react';
import {Button, Text} from 'react-native-paper';
import {deleteHabit} from '@/services/habits.service';
import {useTranslation} from 'react-i18next';
import DialogComponent from '@/components/dialog.component';

const DeleteHabitDialog = ({
  visible,
  onDismiss,
  onDone,
  habitId,
  habitName,
}) => {
  const {t} = useTranslation();

  const handleDelete = () => {
    deleteHabit(habitId);
    onDone();
  };

  return (
    <DialogComponent visible={visible} onDismiss={onDismiss}>
      <DialogComponent.Title>{t('title.delete-habit')}</DialogComponent.Title>
      <DialogComponent.Content>
        <Text variant="bodyMedium">{t('message.delete-habit')}</Text>
        <Text variant="bodyMedium">{habitName}</Text>
      </DialogComponent.Content>
      <DialogComponent.Actions>
        <Button onPress={onDismiss}>{t('button.cancel')}</Button>
        <Button onPress={handleDelete}>{t('button.delete')}</Button>
      </DialogComponent.Actions>
    </DialogComponent>
  );
};

export default DeleteHabitDialog;
