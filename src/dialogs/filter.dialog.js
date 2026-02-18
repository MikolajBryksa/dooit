import React from 'react';
import {Button, List} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {getLocalDateKey, dateToWeekday} from '@/utils';
import GradientDialog from '@/gradients/dialog.gradient';

const FilterDialog = ({visible, onDismiss, filterDay, setFilterDay}) => {
  const {t} = useTranslation();
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

  const handleSelectDay = day => {
    setFilterDay(day);
    onDismiss();
  };

  return (
    <GradientDialog visible={visible} onDismiss={onDismiss}>
      <GradientDialog.Title>{t('title.filter')}</GradientDialog.Title>
      <GradientDialog.Content>
          {daily.map(day => (
            <List.Item
              key={day}
              title={dayNames[day]}
              onPress={() => handleSelectDay(day)}
              right={props =>
                filterDay === day ? <List.Icon {...props} icon="check" /> : null
              }
            />
          ))}
        </GradientDialog.Content>
        <GradientDialog.Actions>
          <Button onPress={() => handleSelectDay('')}>
            {t('button.reset')}
          </Button>
          <Button
            onPress={() => {
              const weekdayKey = dateToWeekday(getLocalDateKey());
              handleSelectDay(weekdayKey);
            }}>
            {t('button.today')}
          </Button>
        </GradientDialog.Actions>
    </GradientDialog>
  );
};

export default FilterDialog;
