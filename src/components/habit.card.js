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

const HabitCard = ({
  id,
  habitName,
  goodChoice,
  badChoice,
  score,
  level,
  currentStreak,
  desc,
  message,
  repeatDays = [],
  repeatHours = [],
  available,
  fetchHabits,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();

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
      currentStreak,
      desc,
      message,
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
    let updated = {
      id,
      habitName,
      goodChoice,
      badChoice,
      score,
      level,
      currentStreak,
      desc,
      message,
      repeatDays,
      repeatHours,
      available: isAvailable,
    };
    updated[modalField] = newValue;
    updateHabit(
      updated.id,
      updated.habitName,
      updated.goodChoice,
      updated.badChoice,
      updated.score,
      updated.level,
      updated.currentStreak,
      updated.desc,
      updated.message,
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
                <Text variant="bodyMedium">
                  {repeatHours && repeatHours.length > 0
                    ? repeatHours.join(', ')
                    : ''}
                </Text>
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
                    const daily = [
                      'mon',
                      'tue',
                      'wed',
                      'thu',
                      'fri',
                      'sat',
                      'sun',
                    ];
                    const workdays = ['mon', 'tue', 'wed', 'thu', 'fri'];
                    const weekend = ['sat', 'sun'];
                    const sortedDays = [...repeatDays].sort();
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
                    return repeatDays.map(day => t(`date.${day}`)).join(', ');
                  })()}
                </Text>
              </View>
            </TouchableRipple>

            <TouchableRipple onPress={() => openEditModal('score', score)}>
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
            </TouchableRipple>

            <TouchableRipple onPress={() => openEditModal('level', level)}>
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
            </TouchableRipple>

            <TouchableRipple
              onPress={() => openEditModal('currentStreak', currentStreak)}>
              <View style={styles.card__row}>
                <IconButton
                  icon="fire"
                  size={18}
                  style={{margin: 0, marginRight: 4}}
                />
                <Text variant="bodyMedium">
                  {t('card.current-streak')}: {currentStreak}
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
                <Text variant="bodyMedium">{goodChoice}</Text>
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
                <Text variant="bodyMedium">{badChoice}</Text>
              </View>
            </TouchableRipple>

            {desc && (
              <TouchableRipple onPress={() => openEditModal('desc', desc)}>
                <View style={styles.card__row}>
                  <IconButton
                    icon="information-outline"
                    size={18}
                    style={{margin: 0, marginRight: 4}}
                  />
                  <Text variant="bodyMedium">
                    {t('card.desc')}: {desc}
                  </Text>
                </View>
              </TouchableRipple>
            )}

            {message && (
              <TouchableRipple
                onPress={() => openEditModal('message', message)}>
                <View style={styles.card__row}>
                  <IconButton
                    icon="message-outline"
                    size={18}
                    style={{margin: 0, marginRight: 4}}
                  />
                  <Text variant="bodyMedium">
                    {t('card.message')}: {message}
                  </Text>
                </View>
              </TouchableRipple>
            )}
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
          ['score', 'level', 'currentStreak'].includes(modalField)
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
