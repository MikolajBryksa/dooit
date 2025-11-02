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
import {setSettings} from '@/redux/actions';
import ContactModal from '@/modals/contact.modal';
import SupportDialog from '@/dialogs/support.dialog';
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

  const [language, setLanguage] = useState(settings.language);
  const [clockFormat, setClockFormat] = useState(settings.clockFormat);
  const [firstDay, setFirstDay] = useState(settings.firstDay);
  const [cardDuration, setCardDuration] = useState(settings.cardDuration);
  const [currentTheme, setCurrentTheme] = useState(
    settings.currentTheme || systemTheme,
  );

  const handleContactModal = () => {
    setVisibleContactModal(!visibleContactModal);
  };

  const handleSupportDialog = () => {
    setVisibleSupportDialog(!visibleSupportDialog);
  };

  function handleVersion() {
    Linking.openURL(
      'https://play.google.com/store/apps/details?id=com.dooit.bryksa',
    );
  }

  function handleLanguage() {
    const newLanguage = language === 'en' ? 'pl' : 'en';
    const newLocale = newLanguage === 'en' ? 'en' : 'pl';

    i18next.changeLanguage(newLocale);
    LocaleConfig.defaultLocale = newLocale;

    if (newLocale === 'en') {
      registerTranslation('en', en);
    } else if (newLocale === 'pl') {
      registerTranslation('pl', pl);
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

  function handleCardDuration() {
    const options = [3, 4, 5, 2];
    const currentIdx = options.indexOf(cardDuration);
    const nextIdx = (currentIdx + 1) % options.length;
    const newDuration = options[nextIdx];
    setCardDuration(newDuration);
    updateSettingValue('cardDuration', newDuration);
    const updatedSettings = {...settings, cardDuration: newDuration};
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
            <Text variant="titleMedium">{t('settings.card-duration')}</Text>
            <Chip
              icon="clock-outline"
              mode="outlined"
              onPress={handleCardDuration}
              style={styles.chip}>
              {cardDuration} s
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
    </>
  );
};

export default SettingsView;
