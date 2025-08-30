import React from 'react';
import {useSelector} from 'react-redux';
import {SegmentedButtons, Checkbox} from 'react-native-paper';
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

  const daily =
    firstDay === 'sun'
      ? ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      : ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  const workdays = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const weekend = ['sat', 'sun'];

  const isSameSet = (a, b) =>
    a.length === b.length && a.every(x => b.includes(x));

  const segmentValue = React.useMemo(() => {
    if (repeatDays.length === 0) return '';
    if (isSameSet(repeatDays, daily)) return 'daily';
    if (isSameSet(repeatDays, workdays)) return 'workdays';
    if (isSameSet(repeatDays, weekend)) return 'weekend';
    return '';
  }, [repeatDays, daily]);

  const handleSegmentChange = value => {
    if (value === 'daily') setRepeatDays(daily);
    else if (value === 'workdays') setRepeatDays(workdays);
    else if (value === 'weekend') setRepeatDays(weekend);
  };

  const handleCheckboxChange = day => {
    setRepeatDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  return (
    <>
      <SegmentedButtons
        value={segmentValue}
        onValueChange={handleSegmentChange}
        style={styles.segment}
        buttons={[
          {value: 'daily', label: t('date.daily')},
          {value: 'workdays', label: t('date.workdays')},
          {value: 'weekend', label: t('date.weekend')},
        ]}
      />

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
