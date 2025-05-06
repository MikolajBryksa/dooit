import React from 'react';
import {View} from 'react-native';
import {Chip, Checkbox} from 'react-native-paper';
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
