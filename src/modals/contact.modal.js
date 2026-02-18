import React, {useState, useEffect, useMemo, useRef} from 'react';
import {View, ScrollView} from 'react-native';
import {
  Card,
  Button,
  Text,
  TextInput,
  IconButton,
} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {supabase, getSupabaseUserId} from '@/services/supabase.service';
import {getSettingValue} from '@/services/settings.service';
import {useNetworkStatus} from '@/hooks';
import {logError} from '@/services/errors.service.js';
import realm from '@/storage/schemas';
import {initializeAnonymousAuth} from '@/services/supabase.service.js';
import GradientModal from '@/gradients/modal.gradient';

const ContactModal = ({visible, onDismiss}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const {isConnected} = useNetworkStatus(true);

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);

  useEffect(() => {
    if (visible) {
      checkRateLimit();

      initializeAnonymousAuth().catch(e => {
        logError(e, 'loadLocalData.initAuth');
      });
    }
  }, [visible]);

  const resetInputs = () => {
    setEmail('');
    setMessage('');
    setSuccess(false);
    setRateLimitError(false);
  };

  const checkRateLimit = () => {
    try {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      const sentMessages = realm
        .objects('ContactMessage')
        .filtered('sent_at >= $0', todayStart);

      if (sentMessages.length >= 3) {
        setRateLimitError(true);
        return false;
      }

      setRateLimitError(false);
      return true;
    } catch (error) {
      logError(error, 'contact.checkRateLimit');
      return true;
    }
  };

  const recordSentMessage = () => {
    try {
      realm.write(() => {
        realm.create('ContactMessage', {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sent_at: new Date(),
        });
      });
    } catch (error) {
      logError(error, 'contact.recordSentMessage');
    }
  };

  const isFormValid = useMemo(() => {
    if (!email.trim() || !message.trim()) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email, message]);

  const handleSubmit = async () => {
    if (!isFormValid || !isConnected || loading || success) {
      return;
    }

    if (!checkRateLimit()) {
      return;
    }

    setLoading(true);

    try {
      const supabaseUserId = await getSupabaseUserId();
      const userName = getSettingValue('userName');

      const {error} = await supabase.from('contact').insert({
        user_id: supabaseUserId,
        user_name: userName,
        email: email.trim(),
        message: message.trim(),
      });

      if (error) {
        await logError(error, 'contact.handleSubmit');
        return;
      }

      recordSentMessage();
      setSuccess(true);
      setTimeout(() => {
        onDismiss();
        setTimeout(() => {
          resetInputs();
        }, 500);
      }, 2000);
    } catch (error) {
      await logError(error, 'contact.handleSubmit');
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
    <GradientModal visible={visible} onDismiss={handleDismiss}>
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
            {!rateLimitError ? t('message.contact') : t('contact.rate-limit')}
          </Text>

          {!rateLimitError && (
            <>
              <TextInput
                mode="outlined"
                placeholder={t('contact.email')}
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
                placeholder={t('contact.message')}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                disabled={loading || success}
                style={{marginBottom: 8, paddingTop: 8}}
                maxLength={2000}
              />
            </>
          )}
        </ScrollView>

        <View style={styles.gap} />

        <Card.Actions>
          {isConnected ? (
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={!isFormValid || loading || success || rateLimitError}
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
    </GradientModal>
  );
};

export default ContactModal;
