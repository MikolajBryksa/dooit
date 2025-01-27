import React, {useState} from 'react';
import {View, ScrollView, Text, Pressable, Switch} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {COLORS, styles} from '../styles';
import packageJson from '../package.json';
import ControlButton from '../components/control.button';
import HeaderButton from '../components/header.button';
import {setSettings} from '../redux/actions';
import {updateSettingValue} from '../services/settings.service';
import i18next from '../i18next';
import {useTranslation} from 'react-i18next';
import {LocaleConfig} from 'react-native-calendars';
import IncomeModal from '../modals/income.modal';

const SettingsView = () => {
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const [language, setLanguage] = useState(settings.language);
  const [weightsTab, setWeightsTab] = useState(settings.weightsTab);
  const [weightUnit, setWeightUnit] = useState(settings.weightUnit);
  const [weightGain, setWeightGain] = useState(settings.weightGain);
  const [costsTab, setCostsTab] = useState(settings.costsTab);
  const [currency, setCurrency] = useState(settings.currency);
  const [costGain, setCostGain] = useState(settings.costGain);
  const [plansTab, setPlansTab] = useState(settings.plansTab);
  const [clockFormat, setClockFormat] = useState(settings.clockFormat);
  const [firstDay, setFirstDay] = useState(settings.firstDay);
  const [tasksTab, setTasksTab] = useState(settings.tasksTab);

  function handleLanguage() {
    const newLanguage = language === 'English' ? 'Polski' : 'English';
    i18next.changeLanguage(newLanguage === 'English' ? 'en' : 'pl');
    LocaleConfig.defaultLocale = newLanguage === 'English' ? 'en' : 'pl';
    setLanguage(newLanguage);
    updateSettingValue('language', newLanguage);
    const updatedSettings = {...settings, language: newLanguage};
    dispatch(setSettings(updatedSettings));
  }

  function handleWeightsTab() {
    const newWeightsTabValue = !weightsTab;
    setWeightsTab(newWeightsTabValue);
    updateSettingValue('weightsTab', newWeightsTabValue);
    const updatedSettings = {...settings, weightsTab: newWeightsTabValue};
    dispatch(setSettings(updatedSettings));
  }

  function handleWeightUnit() {
    const newWeightUnit = weightUnit === 'kg' ? 'lb' : 'kg';
    setWeightUnit(newWeightUnit);
    updateSettingValue('weightUnit', newWeightUnit);
    const updatedSettings = {...settings, weightUnit: newWeightUnit};
    dispatch(setSettings(updatedSettings));
  }

  function handleWeightGain() {
    let newWeightGain;
    if (weightGain === 0.05) {
      newWeightGain = 0.1;
    } else if (weightGain === 0.1) {
      newWeightGain = 0.5;
    } else if (weightGain === 0.5) {
      newWeightGain = 1;
    } else {
      newWeightGain = 0.05;
    }
    newWeightGain = parseFloat(newWeightGain.toFixed(2));
    setWeightGain(newWeightGain);
    updateSettingValue('weightGain', newWeightGain);
    const updatedSettings = {...settings, weightGain: newWeightGain};
    dispatch(setSettings(updatedSettings));
  }

  function handleCostsTab() {
    const newCostsTabValue = !costsTab;
    setCostsTab(newCostsTabValue);
    updateSettingValue('costsTab', newCostsTabValue);
    const updatedSettings = {...settings, costsTab: newCostsTabValue};
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

  function handleCostGain() {
    const costGains = [0.5, 1, 0.1];
    const currentIndex = costGains.indexOf(costGain);
    const newCostGain = costGains[(currentIndex + 1) % costGains.length];
    setCostGain(newCostGain);
    updateSettingValue('costGain', newCostGain);
    const updatedSettings = {...settings, costGain: newCostGain};
    dispatch(setSettings(updatedSettings));
  }

  function handlePlansTab() {
    const newPlansTabValue = !plansTab;
    setPlansTab(newPlansTabValue);
    updateSettingValue('plansTab', newPlansTabValue);
    const updatedSettings = {...settings, plansTab: newPlansTabValue};
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

  function handleTasksTab() {
    const newTasksTabValue = !tasksTab;
    setTasksTab(newTasksTabValue);
    updateSettingValue('tasksTab', newTasksTabValue);
    const updatedSettings = {...settings, tasksTab: newTasksTabValue};
    dispatch(setSettings(updatedSettings));
  }

  function handleIncome() {
    setShowModal(true);
  }

  const dynamicStyle = ({pressed}) => [
    styles.listItem,
    {opacity: pressed ? 0.8 : 1},
  ];

  return (
    <View style={styles.container}>
      {showModal && <IncomeModal setShowModal={setShowModal} />}

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <HeaderButton
            name={`${t('version')} ${packageJson.version}`}
            active={true}
          />
        </View>
        <Pressable style={dynamicStyle} onPress={() => handleLanguage()}>
          <Text style={styles.listItemWhat}>{t('language')} </Text>
          <Text style={styles.listItemChange}>{settings.language}</Text>
        </Pressable>

        <View style={styles.gap} />

        <Pressable style={dynamicStyle} onPress={() => handleWeightsTab()}>
          <Text style={styles.listItemWhat}>{t('weights')}</Text>
          <Switch
            style={styles.switch}
            value={weightsTab}
            onValueChange={() => handleWeightsTab()}
            trackColor={{
              false: COLORS.primary25,
              true: COLORS.primary50,
            }}
            thumbColor={COLORS.primary}
          />
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handleWeightUnit()}>
          <Text style={styles.listItemWhat}>{t('weight-unit')}</Text>
          <Text style={styles.listItemChange}>{settings.weightUnit}</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handleWeightGain()}>
          <Text style={styles.listItemWhat}>{t('weight-gain')}</Text>
          <Text style={styles.listItemChange}>{settings.weightGain}</Text>
        </Pressable>

        <View style={styles.gap} />

        <Pressable style={dynamicStyle} onPress={() => handleCostsTab()}>
          <Text style={styles.listItemWhat}>{t('costs')}</Text>
          <Switch
            style={styles.switch}
            value={costsTab}
            onValueChange={() => handleCostsTab()}
            trackColor={{
              false: COLORS.primary25,
              true: COLORS.primary50,
            }}
            thumbColor={COLORS.primary}
          />
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handleCurrency()}>
          <Text style={styles.listItemWhat}>{t('currency')}</Text>
          <Text style={styles.listItemChange}>{settings.currency}</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handleCostGain()}>
          <Text style={styles.listItemWhat}>{t('cost-gain')}</Text>
          <Text style={styles.listItemChange}>{settings.costGain}</Text>
        </Pressable>

        <View style={styles.gap} />

        <Pressable style={dynamicStyle} onPress={() => handlePlansTab()}>
          <Text style={styles.listItemWhat}>{t('plans')}</Text>
          <Switch
            style={styles.switch}
            value={plansTab}
            onValueChange={() => handlePlansTab()}
            trackColor={{
              false: COLORS.primary25,
              true: COLORS.primary50,
            }}
            thumbColor={COLORS.primary}
          />
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

        <View style={styles.gap} />

        <Pressable style={dynamicStyle} onPress={() => handleTasksTab()}>
          <Text style={styles.listItemWhat}>{t('tasks')}</Text>
          <Switch
            style={styles.switch}
            value={tasksTab}
            onValueChange={() => handleTasksTab()}
            trackColor={{
              false: COLORS.primary25,
              true: COLORS.primary50,
            }}
            thumbColor={COLORS.primary}
          />
        </Pressable>
      </ScrollView>
      <View style={styles.controllers}>
        <ControlButton type="income" press={handleIncome} />
      </View>
    </View>
  );
};

export default SettingsView;
