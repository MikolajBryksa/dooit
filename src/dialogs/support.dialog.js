import React from 'react';
import {Dialog, Portal, Button, Text} from 'react-native-paper';
import {Linking} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';

const SupportDialog = ({visible, onDismiss, onDone}) => {
  const {t} = useTranslation();
  const styles = useStyles();

  const handleSupport = () => {
    Linking.openURL('https://buymeacoffee.com/dooit');
    onDone();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t('title.support')}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{t('message.support')}?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('button.cancel')}</Button>
          <Button onPress={handleSupport}>{t('button.support')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default SupportDialog;
