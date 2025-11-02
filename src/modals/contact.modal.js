import React, {useState} from 'react';
import {View, ScrollView} from 'react-native';
import {
  Card,
  Button,
  Text,
  Modal,
  TextInput,
  IconButton,
} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {supabase} from '@/services/supabase.service';
import {getSettingValue} from '@/services/settings.service';
import {useNetworkStatus} from '@/hooks';

const ContactModal = ({visible, onDismiss}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const {isConnected} = useNetworkStatus(true);

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetInputs = () => {
    setEmail('');
    setMessage('');
    setSuccess(false);
  };

  const isFormValid = React.useMemo(() => {
    if (!email.trim() || !message.trim()) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email, message]);

  const handleSubmit = async () => {
    if (!isFormValid || !isConnected) {
      return;
    }

    setLoading(true);

    try {
      const userId = getSettingValue('userId');

      const {error} = await supabase.from('Contact').insert([
        {
          user_id: userId,
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
        onDismiss();
        setTimeout(() => {
          resetInputs();
        }, 500);
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    if (!loading) {
      onDismiss();
      setTimeout(() => {
        resetInputs();
      }, 500);
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={handleDismiss}
      contentContainerStyle={styles.modal}>
      <Card.Content>
        <View style={styles.modal__title}>
          <Text variant="titleLarge">{t('title.contact')}</Text>
          <IconButton
            icon="close"
            size={20}
            onPress={handleDismiss}
            disabled={loading}
          />
        </View>

        <ScrollView>
          <Text variant="bodyMedium" style={{marginBottom: 16}}>
            {t('message.contact')}
          </Text>

          <TextInput
            mode="outlined"
            label={t('contact.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={loading || success}
            style={{marginBottom: 12}}
            maxLength={60}
          />

          <TextInput
            mode="outlined"
            label={t('contact.message')}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            disabled={loading || success}
            style={{marginBottom: 8}}
            maxLength={2000}
          />
        </ScrollView>

        <View style={styles.gap} />

        <Card.Actions>
          {isConnected ? (
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={!isFormValid || loading || success}
              icon={success ? 'check' : !isFormValid ? 'lock' : 'send'}>
              {success ? t('button.sent') : t('button.send')}
            </Button>
          ) : (
            <Button disabled={true} icon="wifi-off">
              {t('button.offline')}
            </Button>
          )}
        </Card.Actions>
      </Card.Content>
    </Modal>
  );
};

export default ContactModal;
