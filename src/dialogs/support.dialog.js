import React from 'react';
import {Button, Text} from 'react-native-paper';
import {Linking} from 'react-native';
import {useTranslation} from 'react-i18next';
import DialogComponent from '@/components/dialog.component';

const SupportDialog = ({visible, onDismiss, onDone}) => {
  const {t} = useTranslation();

  const handleSupport = () => {
    Linking.openURL('https://buymeacoffee.com/dooit');
    onDone();
  };

  return (
    <DialogComponent visible={visible} onDismiss={onDismiss}>
      <DialogComponent.Title>{t('title.support')}</DialogComponent.Title>
      <DialogComponent.Content>
        <Text variant="bodyMedium">{t('message.support')}</Text>
      </DialogComponent.Content>
      <DialogComponent.Actions>
        <Button onPress={onDismiss}>{t('button.cancel')}</Button>
        <Button onPress={handleSupport}>{t('button.buy')}</Button>
      </DialogComponent.Actions>
    </DialogComponent>
  );
};

export default SupportDialog;
