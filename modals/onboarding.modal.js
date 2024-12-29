import React, {useState} from 'react';
import {Modal, View, Text, Pressable} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ControlButton from '../components/control.button';
import {styles} from '../styles';
import {useTranslation} from 'react-i18next';
import {setSettings} from '../redux/actions';
import i18next from '../i18next';
import {LocaleConfig} from 'react-native-calendars';
import {updateSettingValue} from '../services/settings.service';

const OnboardingModal = ({setShowModal}) => {
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const [language, setLanguage] = useState(settings.language);
  const [weightUnit, setWeightUnit] = useState(settings.weightUnit);
  const [currency, setCurrency] = useState(settings.currency);
  const [clockFormat, setClockFormat] = useState(settings.clockFormat);
  const [firstDay, setFirstDay] = useState(settings.firstDay);

  function handleAccept() {
    setShowModal(false);
    dispatch(setSettings({...settings, firstLaunch: false}));
    updateSettingValue('firstLaunch', false);
  }

  function handleLanguage() {
    const newLanguage = language === 'English' ? 'Polski' : 'English';
    i18next.changeLanguage(newLanguage === 'English' ? 'en' : 'pl');
    LocaleConfig.defaultLocale = newLanguage === 'English' ? 'en' : 'pl';
    setLanguage(newLanguage);
    updateSettingValue('language', newLanguage);
    const updatedSettings = {...settings, language: newLanguage};
    dispatch(setSettings(updatedSettings));
  }

  function handleWeightUnit() {
    const newWeightUnit = weightUnit === 'kg' ? 'lb' : 'kg';
    setWeightUnit(newWeightUnit);
    updateSettingValue('weightUnit', newWeightUnit);
    const updatedSettings = {...settings, weightUnit: newWeightUnit};
    dispatch(setSettings(updatedSettings));
  }

  function handleCurrency() {
    const currencies = ['zł', '$', '€'];
    const currentIndex = currencies.indexOf(currency);
    const newCurrency = currencies[(currentIndex + 1) % currencies.length];
    setCurrency(newCurrency);
    updateSettingValue('currency', newCurrency);
    const updatedSettings = {...settings, currency: newCurrency};
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
    const newFirstDay = firstDay === 'Monday' ? 'Sunday' : 'Monday';
    setFirstDay(newFirstDay);
    updateSettingValue('firstDay', newFirstDay);
    const updatedSettings = {...settings, firstDay: newFirstDay};
    dispatch(setSettings(updatedSettings));
  }

  const dynamicStyle = ({pressed}) => [
    styles.listItem,
    {opacity: pressed ? 0.8 : 1},
  ];

  return (
    <Modal transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.center}>{t('welcome')}</Text>
        </View>

        <Pressable style={dynamicStyle} onPress={() => handleLanguage()}>
          <Text style={styles.listItemWhat}>{t('language')} </Text>
          <Text style={styles.listItemChange}>{settings.language}</Text>
        </Pressable>

        <Pressable style={dynamicStyle} onPress={() => handleWeightUnit()}>
          <Text style={styles.listItemWhat}>{t('weight-unit')}</Text>
          <Text style={styles.listItemChange}>{settings.weightUnit}</Text>
        </Pressable>

        <Pressable style={dynamicStyle} onPress={() => handleCurrency()}>
          <Text style={styles.listItemWhat}>{t('currency')}</Text>
          <Text style={styles.listItemChange}>{settings.currency}</Text>
        </Pressable>

        <Pressable style={dynamicStyle} onPress={() => handleClockFormat()}>
          <Text style={styles.listItemWhat}>{t('clock-format')}</Text>
          <Text style={styles.listItemChange}>{settings.clockFormat}</Text>
        </Pressable>

        <Pressable style={dynamicStyle} onPress={() => handleFirstDay()}>
          <Text style={styles.listItemWhat}>{t('first-day')}</Text>
          <Text style={styles.listItemChange}>
            {settings.firstDay === 'Monday'
              ? t('first-day-monday')
              : t('first-day-sunday')}
          </Text>
        </Pressable>

        <View style={styles.controllers}>
          <ControlButton type="accept" press={handleAccept} />
        </View>
      </View>
    </Modal>
  );
};

export default OnboardingModal;
