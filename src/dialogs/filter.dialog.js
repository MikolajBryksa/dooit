import React from 'react';
import {Dialog, Portal, Button, List} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {getLocalDateKey, dateToWeekday} from '@/utils';

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
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t('title.filter')}</Dialog.Title>
        <Dialog.Content>
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
        </Dialog.Content>
        <Dialog.Actions>
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
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default FilterDialog;
