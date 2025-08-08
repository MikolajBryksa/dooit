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
  goodChoice,
  badChoice,
  score,
  level,
  duration,
  repeatDays = [],
  repeatHours = [],
  available,
  fetchHabits,
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
    updateHabit(
      id,
      habitName,
      goodChoice,
      badChoice,
      score,
      level,
      duration,
      repeatDays,
      repeatHours,
      newAvailable,
    );
    fetchHabits();
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
      goodChoice,
      badChoice,
      score,
      level,
      duration,
      repeatDays,
      repeatHours,
      available: isAvailable,
    };
    updated[modalField] = sortedValue;
    updateHabit(
      updated.id,
      updated.habitName,
      updated.goodChoice,
      updated.badChoice,
      updated.score,
      updated.level,
      updated.duration,
      updated.repeatDays,
      updated.repeatHours,
      updated.available,
    );
    fetchHabits();
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

            {/* <TouchableRipple onPress={() => openEditModal('score', score)}>
              <View style={styles.card__row}>
                <IconButton
                  icon="chart-line"
                  size={18}
                  style={{margin: 0, marginRight: 4}}
                />
                <Text variant="bodyMedium">
                  {t('card.score')}: {score}
                </Text>
              </View>
            </TouchableRipple> */}

            {/* <TouchableRipple onPress={() => openEditModal('level', level)}>
              <View style={styles.card__row}>
                <IconButton
                  icon="star"
                  size={18}
                  style={{margin: 0, marginRight: 4}}
                />
                <Text variant="bodyMedium">
                  {t('card.level')}: {level}
                </Text>
              </View>
            </TouchableRipple> */}

            <TouchableRipple
              onPress={() => openEditModal('duration', duration)}>
              <View style={styles.card__row}>
                <IconButton
                  icon="timer"
                  size={18}
                  style={{margin: 0, marginRight: 4}}
                />
                <Text variant="bodyMedium">
                  {t('card.duration')}: {duration} min
                </Text>
              </View>
            </TouchableRipple>

            <TouchableRipple
              onPress={() => openEditModal('goodChoice', goodChoice)}>
              <View style={styles.card__row}>
                <IconButton
                  icon="thumb-up"
                  size={18}
                  style={{margin: 0, marginRight: 4}}
                />
                <View style={{flex: 1}}>
                  <Text
                    variant="bodyMedium"
                    style={{maxWidth: '100%', flexShrink: 1}}>
                    {goodChoice}
                  </Text>
                </View>
              </View>
            </TouchableRipple>

            <TouchableRipple
              onPress={() => openEditModal('badChoice', badChoice)}>
              <View style={styles.card__row}>
                <IconButton
                  icon="thumb-down"
                  size={18}
                  style={{margin: 0, marginRight: 4}}
                />
                <View style={{flex: 1}}>
                  <Text
                    variant="bodyMedium"
                    style={{maxWidth: '100%', flexShrink: 1}}>
                    {badChoice}
                  </Text>
                </View>
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
          ['score', 'level', 'duration'].includes(modalField)
            ? 'numeric'
            : 'default'
        }
      />

      <DeleteDialog
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        onDone={() => {
          setDeleteDialogVisible(false);
          fetchHabits();
        }}
        habitId={id}
        habitName={habitName}
      />
    </>
  );
};

export default HabitCard;
