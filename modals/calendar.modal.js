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
import {styles} from '../styles';
import {useTranslation} from 'react-i18next';

const CalendarModal = ({visible, onDismiss, setSelectedDay}) => {
  const settings = useSelector(state => state.settings);
  const {t} = useTranslation();
  const [date, setDate] = useState(new Date());

  const handleChange = ({date: selectedDate}) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleToday = () => {
    const currentDay = new Date().toISOString().split('T')[0];
    setSelectedDay(currentDay);
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
              startWeekOnMonday={settings.firstDay === 'Monday' ? true : false}
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
