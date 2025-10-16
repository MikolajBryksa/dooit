import React from 'react';
import {Dialog, Portal, Button, Text} from 'react-native-paper';
import {deleteHabit} from '@/services/habits.service';
import {useTranslation} from 'react-i18next';

const DeleteDialog = ({visible, onDismiss, onDone, habitId, habitName}) => {
  const {t} = useTranslation();

  const handleDelete = () => {
    deleteHabit(habitId);
    onDone();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t('title.delete')}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            {t('message.delete')}
            {habitName}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('button.cancel')}</Button>
          <Button onPress={handleDelete}>{t('button.delete')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default DeleteDialog;
