import React from 'react';
import {View} from 'react-native';
import {Button, Checkbox} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useStyles} from '../styles';

const DaysSelector = ({repeatDays, setRepeatDays}) => {
  const {t} = useTranslation();
  const styles = useStyles();

  const dayNames = {
    mon: t('date.mon'),
    tue: t('date.tue'),
    wed: t('date.wed'),
    thu: t('date.thu'),
    fri: t('date.fri'),
    sat: t('date.sat'),
    sun: t('date.sun'),
  };

  const daily = Object.keys(dayNames);
  const workdays = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const weekend = ['sat', 'sun'];

  const handleCheckboxChange = day => {
    setRepeatDays(prevState =>
      Array.isArray(prevState)
        ? prevState.includes(day)
          ? prevState.filter(d => d !== day)
          : [...prevState, day]
        : [day],
    );
  };

  return (
    <>
      <View style={styles.daysSelector}>
        <Button
          mode="outlined"
          onPress={() => setRepeatDays(daily)}
          style={{marginHorizontal: 3}}>
          {t('date.daily')}
        </Button>
        <Button
          mode="outlined"
          onPress={() => setRepeatDays(workdays)}
          style={{marginHorizontal: 3}}>
          {t('date.workdays')}
        </Button>
        <Button
          mode="outlined"
          onPress={() => setRepeatDays(weekend)}
          style={{marginHorizontal: 3}}>
          {t('date.weekend')}
        </Button>
      </View>

      {Object.keys(dayNames).map(day => (
        <Checkbox.Item
          key={day}
          label={dayNames[day]}
          status={repeatDays.includes(day) ? 'checked' : 'unchecked'}
          onPress={() => handleCheckboxChange(day)}
        />
      ))}
    </>
  );
};

export default DaysSelector;
