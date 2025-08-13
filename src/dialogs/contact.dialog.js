import React from 'react';
import {Dialog, Portal, Button, Text} from 'react-native-paper';
import {Linking} from 'react-native';
import {useTranslation} from 'react-i18next';

const ContactDialog = ({visible, onDismiss, onDone}) => {
  const {t} = useTranslation();

  const handleContact = () => {
    Linking.openURL('https://www.linkedin.com/in/mikolajbryksa');
    onDone();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t('title.contact')}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{t('message.contact')}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('button.cancel')}</Button>
          <Button onPress={handleContact}>{t('button.contact')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ContactDialog;
