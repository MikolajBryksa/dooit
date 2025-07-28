import React from 'react';
import { useSelector } from 'react-redux';
import {View} from 'react-native';
import {Chip, Checkbox} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';

const DaysSelector = ({repeatDays, setRepeatDays}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const firstDay = useSelector(state => state.settings.firstDay);

  const dayNames = {
    mon: t('date.monday'),
    tue: t('date.tuesday'),
    wed: t('date.wednesday'),
    thu: t('date.thursday'),
    fri: t('date.friday'),
    sat: t('date.saturday'),
    sun: t('date.sunday'),
  };

  const daily = firstDay === 'sun'
    ? ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    : ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
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
      <View style={styles.daysSelector__container}>
        <Chip
          mode="outlined"
          onPress={() =>
            setRepeatDays(prevState =>
              daily.every(day => prevState.includes(day))
                ? prevState.filter(day => !daily.includes(day))
                : [...new Set([...prevState, ...daily])],
            )
          }
          style={styles.daysSelector__chip}>
          {t('date.daily')}
        </Chip>
        <Chip
          mode="outlined"
          onPress={() =>
            setRepeatDays(prevState =>
              workdays.every(day => prevState.includes(day))
                ? prevState.filter(day => !workdays.includes(day))
                : [...new Set([...prevState, ...workdays])],
            )
          }
          style={styles.daysSelector__chip}>
          {t('date.workdays')}
        </Chip>
        <Chip
          mode="outlined"
          onPress={() =>
            setRepeatDays(prevState =>
              weekend.every(day => prevState.includes(day))
                ? prevState.filter(day => !weekend.includes(day))
                : [...new Set([...prevState, ...weekend])],
            )
          }
          style={styles.daysSelector__chip}>
          {t('date.weekend')}
        </Chip>
      </View>

      {daily.map(day => (
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
