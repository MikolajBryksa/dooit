import React from 'react';
import {Button, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import DialogComponent from '@/components/dialog.component';

const ResetDayDialog = ({visible, onDismiss, onConfirm}) => {
  const {t} = useTranslation();

  return (
    <DialogComponent
      visible={visible}
      onDismiss={onDismiss}
      title={t('title.reset-day')}>
      <DialogComponent.Content>
        <Text variant="bodyMedium">{t('message.reset-day')}</Text>
      </DialogComponent.Content>
      <DialogComponent.Actions>
        <Button onPress={onDismiss}>{t('button.cancel')}</Button>
        <Button onPress={onConfirm}>{t('button.reset')}</Button>
      </DialogComponent.Actions>
    </DialogComponent>
  );
};

export default ResetDayDialog;
