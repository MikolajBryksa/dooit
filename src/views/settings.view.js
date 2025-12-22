import React, {useState} from 'react';
import {ScrollView, View, Linking} from 'react-native';
import {Appbar, Text, Card, Chip} from 'react-native-paper';
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

  async function handleTestConnection() {
    setTestResult(null);
    setTestVisible(false);
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      if (res.status === 200) {
        setTestResult('ok');
      } else {
        setTestResult('fail');
      }
    } catch (e) {
      setTestResult('fail');
    }
    setTestVisible(true);
    setTimeout(() => {
      setTestVisible(false);
      setTestResult(null);
    }, 3000);
  }

  const handleContactModal = () => {
    setVisibleContactModal(!visibleContactModal);
  };

  const handleSupportDialog = () => {
    setVisibleSupportDialog(!visibleSupportDialog);
  };

  const handleNameModal = () => {
    setVisibleNameModal(!visibleNameModal);
  };

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

    if (newLocale === 'en') {
      registerTranslation('en', en);
    } else if (newLocale === 'pl') {
      registerTranslation('pl', pl);
    }

    const updatedCount = translateDefaultHabits(oldLanguage, newLanguage);
    if (updatedCount > 0) {
      const habits = getHabits();
      dispatch(setHabits(habits));
    }

    setLanguage(newLanguage);
    updateSettingValue('language', newLanguage);
    const updatedSettings = {...settings, language: newLanguage};
    dispatch(setSettings(updatedSettings));
  }

  async function handleNotifications() {
    await notifee.openNotificationSettings();
  }

  function handleClockFormat() {
    const newClockFormat = clockFormat === '24 h' ? '12 h' : '24 h';
    setClockFormat(newClockFormat);
    updateSettingValue('clockFormat', newClockFormat);
    const updatedSettings = {...settings, clockFormat: newClockFormat};
    dispatch(setSettings(updatedSettings));
  }

  function handleFirstDay() {
    const newFirstDay = firstDay === 'mon' ? 'sun' : 'mon';
    setFirstDay(newFirstDay);
    updateSettingValue('firstDay', newFirstDay);
    const updatedSettings = {...settings, firstDay: newFirstDay};
    dispatch(setSettings(updatedSettings));
  }

  function handleCurrentTheme() {
    const newCurrentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newCurrentTheme);
    updateSettingValue('currentTheme', newCurrentTheme);
    const updatedSettings = {...settings, currentTheme: newCurrentTheme};
    dispatch(setSettings(updatedSettings));
  }

  return (
    <>
      <Appbar.Header style={styles.topBar__shadow}>
        <Appbar.Content title={t('view.settings')} />

        <Appbar.Action
          icon="chat"
          onPress={() => {
            handleContactModal();
          }}
        />
        <Appbar.Action
          icon="coffee"
          onPress={() => {
            handleSupportDialog();
          }}
        />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content style={styles.card__header}>
            <Text variant="titleMedium">{t('settings.version')}</Text>
            <Chip
              icon="information-outline"
              mode="outlined"
              onPress={handleVersion}
              style={styles.chip}>
              {packageJson.version}
            </Chip>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content style={styles.card__header}>
            <Text variant="titleMedium">{t('settings.user-name')}</Text>
            <Chip
              icon="account-outline"
              mode="outlined"
              onPress={handleNameModal}
              style={styles.chip}>
              {settings.userName}
            </Chip>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content style={styles.card__header}>
            <Text variant="titleMedium">{t('settings.language')}</Text>
            <Chip
              icon="translate"
              mode="outlined"
              onPress={handleLanguage}
              style={styles.chip}>
              {t(`settings.${language}`)}
            </Chip>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content style={styles.card__header}>
            <Text variant="titleMedium">{t('settings.notifications')}</Text>
            <Chip
              icon={
                settings.notifications ? 'bell-outline' : 'bell-off-outline'
              }
              mode="outlined"
              onPress={handleNotifications}
              style={styles.chip}>
              {settings.notifications
                ? t('settings.enabled')
                : t('settings.disabled')}
            </Chip>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content style={styles.card__header}>
            <Text variant="titleMedium">{t('settings.clock-format')}</Text>
            <Chip
              icon="clock-outline"
              mode="outlined"
              onPress={handleClockFormat}
              style={styles.chip}>
              {clockFormat}
            </Chip>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content style={styles.card__header}>
            <Text variant="titleMedium">{t('settings.first-day')}</Text>
            <Chip
              icon="calendar"
              mode="outlined"
              onPress={handleFirstDay}
              style={styles.chip}>
              {t(`date.${firstDay === 'mon' ? 'monday' : 'sunday'}`)}
            </Chip>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content style={styles.card__header}>
            <Text variant="titleMedium">{t('settings.theme')}</Text>
            <Chip
              icon={currentTheme === 'dark' ? 'weather-night' : 'weather-sunny'}
              mode="outlined"
              onPress={handleCurrentTheme}
              style={styles.chip}>
              {t(`settings.${currentTheme}`)}
            </Chip>
          </Card.Content>
        </Card>

        {__DEV__ && (
          <Card style={styles.card}>
            <Card.Content style={styles.card__header}>
              <Text variant="titleMedium">{t('settings.test-connection')}</Text>
              <Chip
                icon={
                  testResult === 'ok'
                    ? 'check'
                    : testResult === 'fail'
                    ? 'close'
                    : 'wifi'
                }
                mode="outlined"
                onPress={handleTestConnection}
                style={styles.chip}
                disabled={testVisible}>
                {testVisible
                  ? testResult === 'ok'
                    ? t('settings.connection-ok')
                    : t('settings.connection-fail')
                  : t('settings.test')}
              </Chip>
            </Card.Content>
          </Card>
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
        onDone={() => {
          handleSupportDialog();
        }}
      />

      <NameModal visible={visibleNameModal} onDismiss={handleNameModal} />
    </>
  );
};

export default SettingsView;
