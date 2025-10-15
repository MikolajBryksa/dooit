import React, {useState} from 'react';
import {Dialog, Portal, Button, Text, TextInput} from 'react-native-paper';
import {ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {supabase} from '../services/supabase.service';

const ContactDialog = ({visible, onDismiss, onDone}) => {
  const {t} = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !message.trim()) {
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return;
    }

    setLoading(true);

    try {
      const {data, error} = await supabase
        .from('Contact')
        .insert([
          {
            email: email.trim(),
            message: message.trim(),
          },
        ]);

      if (error) {
        console.error(error);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setEmail('');
        setMessage('');
        setSuccess(false);
        onDone();
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setEmail('');
    setMessage('');
    setSuccess(false);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss}>
        <Dialog.Title>{t('title.contact')}</Dialog.Title>
        <Dialog.Content>
          <ScrollView>
            <Text variant="bodyMedium" style={{marginBottom: 16}}>
              {t('message.contact')}
            </Text>

            <TextInput
              label={t('contact.email')}
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={loading}
              style={{marginBottom: 12}}
            />

            <TextInput
              label={t('contact.message')}
              value={message}
              onChangeText={setMessage}
              mode="outlined"
              multiline
              numberOfLines={4}
              disabled={loading}
              style={{marginBottom: 8}}
            />
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleDismiss} disabled={loading || success}>
            {t('button.cancel')}
          </Button>
          <Button
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || success}
            icon={success ? 'check' : undefined}>
            {success ? t('button.sent') : t('button.send')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ContactDialog;
