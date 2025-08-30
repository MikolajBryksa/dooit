import React, {useState} from 'react';
import {
  Card,
  Text,
  Switch,
  IconButton,
  TouchableRipple,
} from 'react-native-paper';
import {View} from 'react-native';
import {updateHabit} from '@/services/habits.service';
import EditModal from '@/modals/edit.modal';
import DeleteDialog from '@/dialogs/delete.dialog';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useSelector} from 'react-redux';
import {formatHourString} from '@/utils';

const HabitCard = ({
  id,
  habitName,
  habitEnemy,
  goodCounter = 0,
  badCounter = 0,
  skipCounter = 0,
  repeatDays = [],
  repeatHours = [],
  available,
  fetchAllHabits,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const clockFormat = useSelector(state => state.settings.clockFormat);
  const firstDay = useSelector(state => state.settings.firstDay);
  const [isAvailable, setIsAvailable] = useState(available);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalField, setModalField] = useState(null);
  const [modalValue, setModalValue] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const handleToggleAvailable = () => {
    const newAvailable = !isAvailable;
    setIsAvailable(newAvailable);
    updateHabit(id, {available: newAvailable});
    fetchAllHabits();
  };

  const openEditModal = (field, value) => {
    setModalField(field);
    setModalValue(value);
    setModalVisible(true);
  };

  const handleSaveField = newValue => {
    let sortedValue = newValue;
    if (modalField === 'repeatHours' && Array.isArray(newValue)) {
      sortedValue = [...newValue].sort((a, b) => {
        const toSeconds = str => {
          const [h, m] = str.split(':').map(Number);
          return h * 3600 + (m || 0) * 60;
        };
        return toSeconds(a) - toSeconds(b);
      });
    }
    let updated = {
      id,
      habitName,
      habitEnemy,
      goodCounter,
      badCounter,
      skipCounter,
      repeatDays,
      repeatHours,
      available: isAvailable,
    };
    updated[modalField] = sortedValue;
    updateHabit(id, {
      habitName: updated.habitName,
      habitEnemy: updated.habitEnemy,
      goodCounter: updated.goodCounter,
      badCounter: updated.badCounter,
      skipCounter: updated.skipCounter,
      repeatDays: updated.repeatDays,
      repeatHours: updated.repeatHours,
      available: updated.available,
    });
    fetchAllHabits();
  };

  return (
    <>
      <Card style={available ? styles.card : styles.card__deactivated}>
        <Card.Content style={styles.card__title}>
          <TouchableRipple
            onPress={() => openEditModal('habitName', habitName)}>
            <Text variant="titleMedium">{habitName}</Text>
          </TouchableRipple>
          <View style={styles.card__options}>
            <IconButton
              icon="trash-can"
              onPress={() => setDeleteDialogVisible(true)}
            />
            <Switch value={isAvailable} onValueChange={handleToggleAvailable} />
          </View>
        </Card.Content>

        {available && (
          <Card.Content style={styles.card__container}>
            <TouchableRipple
              onPress={() => openEditModal('habitEnemy', habitEnemy)}>
              <View style={styles.card__row}>
                <IconButton
                  icon="alert-circle-outline"
                  size={18}
                  style={{margin: 0, marginRight: 4}}
                />
                <View style={{flex: 1}}>
                  <Text
                    variant="bodyMedium"
                    style={{maxWidth: '100%', flexShrink: 1}}>
                    {habitEnemy}
                  </Text>
                </View>
              </View>
            </TouchableRipple>

            <TouchableRipple
              onPress={() => openEditModal('repeatHours', repeatHours)}>
              <View style={styles.card__row}>
                <IconButton
                  icon="clock"
                  size={18}
                  style={{margin: 0, marginRight: 4}}
                />
                <View style={{flex: 1}}>
                  <Text
                    variant="bodyMedium"
                    style={{maxWidth: '100%', flexShrink: 1}}>
                    {repeatHours && repeatHours.length > 0
                      ? repeatHours
                          .map(h => formatHourString(h, clockFormat))
                          .join(', ')
                      : ''}
                  </Text>
                </View>
              </View>
            </TouchableRipple>

            <TouchableRipple
              onPress={() => openEditModal('repeatDays', repeatDays)}>
              <View style={styles.card__row}>
                <IconButton
                  icon="calendar"
                  size={18}
                  style={{margin: 0, marginRight: 4}}
                />
                <Text variant="bodyMedium">
                  {(() => {
                    if (!repeatDays || repeatDays.length === 0) return '';
                    const daily =
                      firstDay === 'sun'
                        ? ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
                        : ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
                    const workdays = ['mon', 'tue', 'wed', 'thu', 'fri'];
                    const weekend = ['sat', 'sun'];
                    const sortedDays = daily.filter(day =>
                      repeatDays.includes(day),
                    );
                    if (
                      sortedDays.length === 7 &&
                      daily.every(day => sortedDays.includes(day))
                    ) {
                      return t('date.daily');
                    }
                    if (
                      sortedDays.length === 5 &&
                      workdays.every(day => sortedDays.includes(day))
                    ) {
                      return t('date.workdays');
                    }
                    if (
                      sortedDays.length === 2 &&
                      weekend.every(day => sortedDays.includes(day))
                    ) {
                      return t('date.weekend');
                    }
                    return sortedDays.map(day => t(`date.${day}`)).join(', ');
                  })()}
                </Text>
              </View>
            </TouchableRipple>

            <View style={styles.gap} />

            <TouchableRipple
              onPress={() => openEditModal('goodCounter', goodCounter)}>
              <View style={styles.card__row}>
                <IconButton
                  icon="thumb-up"
                  size={18}
                  style={{margin: 0, marginRight: 4}}
                />
                <Text variant="bodyMedium">
                  {t('card.goodCounter')}: {goodCounter}
                </Text>
              </View>
            </TouchableRipple>

            <TouchableRipple
              onPress={() => openEditModal('badCounter', badCounter)}>
              <View style={styles.card__row}>
                <IconButton
                  icon="thumb-down"
                  size={18}
                  style={{margin: 0, marginRight: 4}}
                />
                <Text variant="bodyMedium">
                  {t('card.badCounter')}: {badCounter}
                </Text>
              </View>
            </TouchableRipple>

            <TouchableRipple
              onPress={() => openEditModal('skipCounter', skipCounter)}>
              <View style={styles.card__row}>
                <IconButton
                  icon="close"
                  size={18}
                  style={{margin: 0, marginRight: 4}}
                />
                <Text variant="bodyMedium">
                  {t('card.skipCounter')}: {skipCounter}
                </Text>
              </View>
            </TouchableRipple>
          </Card.Content>
        )}
      </Card>

      <EditModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        field={modalField}
        value={modalValue}
        onSave={handleSaveField}
        label={t(`card.${modalField}`)}
        options={
          modalField === 'repeatDays'
            ? ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
            : undefined
        }
        keyboardType={
          ['goodCounter', 'badCounter', 'skipCounter'].includes(modalField)
            ? 'numeric'
            : 'default'
        }
      />

      <DeleteDialog
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        onDone={() => {
          setDeleteDialogVisible(false);
          fetchAllHabits();
        }}
        habitId={id}
        habitName={habitName}
      />
    </>
  );
};

export default HabitCard;
