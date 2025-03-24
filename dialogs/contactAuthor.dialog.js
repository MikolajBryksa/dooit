import React from 'react';
import {Dialog, Portal, Button, Text} from 'react-native-paper';
import {Linking} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '../styles';

const ContactAuthorDialog = ({visible, onDismiss, onDone}) => {
  const {t} = useTranslation();
  const styles = useStyles();

  const handleContact = () => {
    Linking.openURL('https://www.linkedin.com/in/mikolajbryksa');
    onDone();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t('title.contact-author')}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{t('message.contact-author')}?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('button.cancel')}</Button>
          <Button onPress={handleContact}>{t('button.contact')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ContactAuthorDialog;
