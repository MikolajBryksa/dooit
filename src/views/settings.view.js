import React, {useState} from 'react';
import {ScrollView, View, Linking} from 'react-native';
import {Appbar} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import i18next from 'i18next';
import {en, pl, registerTranslation} from 'react-native-paper-dates';
import {LocaleConfig} from 'react-native-calendars';
import {updateSettingValue} from '@/services/settings.service';
import {setSettings, setHabits} from '@/redux/actions';
import {translateDefaultHabits, getHabits} from '@/services/habits.service';
import ContactModal from '@/modals/contact.modal';
import SupportDialog from '@/dialogs/support.dialog';
import NameModal from '@/modals/name.modal';
import {useColorScheme} from 'react-native';
import packageJson from '../../package.json';
import notifee from '@notifee/react-native';
import SettingCard from '@/components/setting.card';
import {testErrorLogging} from '@/services/errors.service';
import GradientAppbar from '@/gradients/appbar.gradient';

const SettingsView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);
  const systemTheme = useColorScheme();

  const [visibleContactModal, setVisibleContactModal] = useState(false);
  const [visibleSupportDialog, setVisibleSupportDialog] = useState(false);
  const [visibleNameModal, setVisibleNameModal] = useState(false);

  const [language, setLanguage] = useState(settings.language);
  const [clockFormat, setClockFormat] = useState(settings.clockFormat);
  const [firstDay, setFirstDay] = useState(settings.firstDay);
  const [currentTheme, setCurrentTheme] = useState(
    settings.currentTheme || systemTheme,
  );

  // Test Connection
  const [testResult, setTestResult] = useState(null);
  const [testVisible, setTestVisible] = useState(false);

  // Test Error Logging
  const [testErrorDone, setTestErrorDone] = useState(false);

  async function handleTestConnection() {
    setTestResult(null);
    setTestVisible(false);
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      setTestResult(res.status === 200 ? 'ok' : 'fail');
    } catch (e) {
      setTestResult('fail');
    }
    setTestVisible(true);
    setTimeout(() => {
      setTestVisible(false);
      setTestResult(null);
    }, 3000);
  }

  async function handleTestError() {
    await testErrorLogging();
    setTestErrorDone(true);
    setTimeout(() => {
      setTestErrorDone(false);
    }, 3000);
  }

  const handleContactModal = () => setVisibleContactModal(v => !v);
  const handleSupportDialog = () => setVisibleSupportDialog(v => !v);
  const handleNameModal = () => setVisibleNameModal(v => !v);

  function handleVersion() {
    Linking.openURL(
      'https://play.google.com/store/apps/details?id=com.dooit.bryksa',
    );
  }

  function handleLanguage() {
    const oldLanguage = language;
    const newLanguage = language === 'en' ? 'pl' : 'en';
    const newLocale = newLanguage === 'en' ? 'en' : 'pl';

    i18next.changeLanguage(newLocale);
    LocaleConfig.defaultLocale = newLocale;

    if (newLocale === 'en') registerTranslation('en', en);
    else registerTranslation('pl', pl);

    const updatedCount = translateDefaultHabits(oldLanguage, newLanguage);
    if (updatedCount > 0) {
      const habits = getHabits();
      dispatch(setHabits(habits));
    }

    setLanguage(newLanguage);
    updateSettingValue('language', newLanguage);
    dispatch(setSettings({...settings, language: newLanguage}));
  }

  async function handleNotifications() {
    await notifee.openNotificationSettings();
  }

  function handleClockFormat() {
    const newClockFormat = clockFormat === '24 h' ? '12 h' : '24 h';
    setClockFormat(newClockFormat);
    updateSettingValue('clockFormat', newClockFormat);
    dispatch(setSettings({...settings, clockFormat: newClockFormat}));
  }

  function handleFirstDay() {
    const newFirstDay = firstDay === 'mon' ? 'sun' : 'mon';
    setFirstDay(newFirstDay);
    updateSettingValue('firstDay', newFirstDay);
    dispatch(setSettings({...settings, firstDay: newFirstDay}));
  }

  function handleCurrentTheme() {
    const newCurrentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newCurrentTheme);
    updateSettingValue('currentTheme', newCurrentTheme);
    dispatch(setSettings({...settings, currentTheme: newCurrentTheme}));
  }

  return (
    <>
      <GradientAppbar>
        <Appbar.Content title={t('view.settings')} />
        <Appbar.Action icon="chat" onPress={handleContactModal} />
        <Appbar.Action icon="coffee" onPress={handleSupportDialog} />
      </GradientAppbar>

      <ScrollView style={styles.container}>
        <SettingCard
          label={t('settings.version')}
          value={packageJson.version}
          icon="information-outline"
          onPress={handleVersion}
        />

        <SettingCard
          label={t('settings.user-name')}
          value={settings.userName}
          icon="account-outline"
          onPress={handleNameModal}
        />

        <SettingCard
          label={t('settings.language')}
          value={t(`settings.${language}`)}
          icon="translate"
          onPress={handleLanguage}
        />

        <SettingCard
          label={t('settings.notifications')}
          value={
            settings.notifications
              ? t('settings.enabled')
              : t('settings.disabled')
          }
          icon={settings.notifications ? 'bell-outline' : 'bell-off-outline'}
          onPress={handleNotifications}
        />

        <SettingCard
          label={t('settings.clock-format')}
          value={clockFormat}
          icon="clock-outline"
          onPress={handleClockFormat}
        />

        <SettingCard
          label={t('settings.first-day')}
          value={t(`date.${firstDay === 'mon' ? 'monday' : 'sunday'}`)}
          icon="calendar"
          onPress={handleFirstDay}
        />

        <SettingCard
          label={t('settings.theme')}
          value={t(`settings.${currentTheme}`)}
          icon={currentTheme === 'dark' ? 'weather-night' : 'weather-sunny'}
          onPress={handleCurrentTheme}
        />

        {__DEV__ && (
          <>
            <SettingCard
              label={t('settings.test-connection')}
              value={
                testVisible
                  ? testResult === 'ok'
                    ? t('settings.connection-ok')
                    : t('settings.connection-fail')
                  : t('settings.test')
              }
              icon={
                testResult === 'ok'
                  ? 'check'
                  : testResult === 'fail'
                  ? 'close'
                  : 'wifi'
              }
              onPress={handleTestConnection}
              disabled={testVisible}
            />

            <SettingCard
              label={t('settings.test-error-logging')}
              value={
                testErrorDone
                  ? t('settings.error-logged')
                  : t('settings.log-error')
              }
              icon={testErrorDone ? 'bug-check' : 'bug'}
              onPress={handleTestError}
              disabled={testErrorDone}
            />
          </>
        )}

        <View style={styles.gap} />
      </ScrollView>

      <ContactModal
        visible={visibleContactModal}
        onDismiss={handleContactModal}
      />

      <SupportDialog
        visible={visibleSupportDialog}
        onDismiss={handleSupportDialog}
        onDone={handleSupportDialog}
      />

      <NameModal visible={visibleNameModal} onDismiss={handleNameModal} />
    </>
  );
};

export default SettingsView;
