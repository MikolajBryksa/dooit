import React from 'react';
import {Button, Text} from 'react-native-paper';
import {deleteHabit} from '@/services/habits.service';
import {useTranslation} from 'react-i18next';
import GradientDialog from '@/gradients/dialog.gradient';

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
    <GradientDialog visible={visible} onDismiss={onDismiss}>
      <GradientDialog.Title>{t('title.delete-habit')}</GradientDialog.Title>
      <GradientDialog.Content>
        <Text variant="bodyMedium">{t('message.delete-habit')}</Text>
        <Text variant="bodyMedium">{habitName}</Text>
      </GradientDialog.Content>
      <GradientDialog.Actions>
        <Button onPress={onDismiss}>{t('button.cancel')}</Button>
        <Button onPress={handleDelete}>{t('button.delete')}</Button>
      </GradientDialog.Actions>
    </GradientDialog>
  );
};

export default DeleteHabitDialog;
