import React from 'react';
import {Button, Text} from 'react-native-paper';
import DialogComponent from '@/components/dialog.component';
import {useTranslation} from 'react-i18next';

const MotivationDialog = ({visible, onDismiss, message, onTry, onSkip}) => {
  const {t} = useTranslation();

  return (
    <DialogComponent
      visible={visible}
      onDismiss={onDismiss}
      title={t('title.motivation')}>
      <DialogComponent.Content>
        <Text variant="bodyMedium">{message}</Text>
      </DialogComponent.Content>
      <DialogComponent.Actions>
        <Button onPress={onSkip}>{t('button.skip')}</Button>
        <Button onPress={onTry}>{t('button.try')}</Button>
      </DialogComponent.Actions>
    </DialogComponent>
  );
};

export default MotivationDialog;
