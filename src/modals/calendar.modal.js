import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {View} from 'react-native';
import {
  Card,
  Button,
  Text,
  Divider,
  Modal,
  Portal,
  IconButton,
} from 'react-native-paper';
import {Calendar} from 'react-native-paper-dates';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {formatDateToYYMMDD} from '@/utils';
import {updateTempValue} from '@/services/temp.service';

const CalendarModal = ({visible, onDismiss, setSelectedDay}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const settings = useSelector(state => state.settings);
  const [date, setDate] = useState(new Date());

  const handleChange = ({date: selectedDate}) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleToday = () => {
    const currentDay = formatDateToYYMMDD();
    setSelectedDay(currentDay);
    updateTempValue('selectedDay', currentDay);
    setTimeout(() => setDate(new Date()), 500);
    onDismiss();
  };

  const handleConfirm = () => {
    if (date) {
      const localDate = new Date(date);
      localDate.setHours(
        localDate.getHours() + Math.abs(localDate.getTimezoneOffset() / 60),
      );
      const currentDay = new Date(localDate).toISOString().split('T')[0];
      setSelectedDay(currentDay);
      updateTempValue('selectedDay', currentDay);
    }
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}>
        <Card.Content>
          <View style={styles.title}>
            <Text variant="titleLarge">{t('title.choose-date')}</Text>
            <IconButton icon="close" size={20} onPress={onDismiss} />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.calendar}>
            <Calendar
              locale={settings.language === 'English' ? 'en' : 'pl'}
              mode="single"
              date={date}
              onChange={handleChange}
              startYear={2000}
              endYear={2100}
              disableWeekDays={false}
              startWeekOnMonday={settings.firstDay === 'mon' ? true : false}
            />
          </View>

          <Divider style={styles.divider} />
        </Card.Content>
        <Card.Actions>
          <Button mode="outlined" onPress={handleToday}>
            {t('button.today')}
          </Button>
          <Button mode="contained" onPress={handleConfirm} disabled={!date}>
            {t('button.accept')}
          </Button>
        </Card.Actions>
      </Modal>
    </Portal>
  );
};

export default CalendarModal;
