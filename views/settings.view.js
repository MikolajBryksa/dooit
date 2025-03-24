import React, {useState} from 'react';
import {View} from 'react-native';
import {Appbar, Text, Divider, Card, Button} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useStyles} from '../styles';
import i18next from 'i18next';
import {en, pl, registerTranslation} from 'react-native-paper-dates';
import {LocaleConfig} from 'react-native-calendars';
import {updateSettingValue} from '../services/settings.service';
import {setSettings} from '../redux/actions';
import ContactAuthorDialog from '../dialogs/contactAuthor.dialog';
import SupportAuthorDialog from '../dialogs/supportAuthor.dialog';
import {useColorScheme} from 'react-native';

const SettingsView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);
  const systemTheme = useColorScheme();

  const [visibleContactDialog, setVisibleContactDialog] = useState(false);
  const [visibleSupportDialog, setVisibleSupportDialog] = useState(false);

  const [language, setLanguage] = useState(settings.language);
  const [clockFormat, setClockFormat] = useState(settings.clockFormat);
  const [firstDay, setFirstDay] = useState(settings.firstDay);
  const [currentTheme, setCurrentTheme] = useState(
    settings.currentTheme || systemTheme,
  );

  const handleContactDialog = () => {
    setVisibleContactDialog(!visibleContactDialog);
  };

  const handleSupportDialog = () => {
    setVisibleSupportDialog(!visibleSupportDialog);
  };

  function handleLanguage() {
    const newLanguage = language === 'English' ? 'Polski' : 'English';
    const newLocale = newLanguage === 'English' ? 'en' : 'pl';

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

  function handleClockFormat() {
    const newClockFormat = clockFormat === '24h' ? '12h' : '24h';
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
      <Appbar.Header>
        <Appbar.Content title={t('views.settings')} />
        <Appbar.Action
          icon="chat"
          onPress={() => {
            handleContactDialog();
          }}
        />
        <Appbar.Action
          icon="coffee"
          onPress={() => {
            handleSupportDialog();
          }}
        />
      </Appbar.Header>

      <View style={styles.container}>
        <ContactAuthorDialog
          visible={visibleContactDialog}
          onDismiss={handleContactDialog}
          onDone={() => {
            handleContactDialog();
          }}
        />

        <SupportAuthorDialog
          visible={visibleSupportDialog}
          onDismiss={handleSupportDialog}
          onDone={() => {
            handleSupportDialog();
          }}
        />

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.title}>
              <Text variant="titleLarge">{language}</Text>
            </View>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium">{t('settings.language')}</Text>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => {
                handleLanguage();
              }}>
              {t('button.change')}
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.title}>
              <Text variant="titleLarge">{clockFormat}</Text>
            </View>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium">{t('settings.clock-format')}</Text>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => {
                handleClockFormat();
              }}>
              {t('button.change')}
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.title}>
              <Text variant="titleLarge">{t(`date.${firstDay}`)}</Text>
            </View>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium">{t('settings.first-day')}</Text>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => {
                handleFirstDay();
              }}>
              {t('button.change')}
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.title}>
              <Text variant="titleLarge">{t(`settings.${currentTheme}`)}</Text>
            </View>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium">{t('settings.theme')}</Text>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => {
                handleCurrentTheme();
              }}>
              {t('button.change')}
            </Button>
          </Card.Actions>
        </Card>
      </View>
    </>
  );
};

export default SettingsView;
