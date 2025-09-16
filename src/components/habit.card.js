import React, {useState} from 'react';
import {
  Card,
  Text,
  Switch,
  IconButton,
  TouchableRipple,
} from 'react-native-paper';
import {View} from 'react-native';
import {updateHabitValue} from '@/services/habits.service';
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
  onEdit,
  onboardingMode = false,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const clockFormat = useSelector(state => state.settings.clockFormat);
  const firstDay = useSelector(state => state.settings.firstDay);
  const [isAvailable, setIsAvailable] = useState(available);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [equalizeDialogVisible, setEqualizeDialogVisible] = useState(false);

  const handleToggleAvailable = () => {
    const newAvailable = !isAvailable;
    setIsAvailable(newAvailable);
    updateHabitValue(id, 'available', newAvailable);
    fetchAllHabits();
  };

  const openEditModal = (field, value) => {
    onEdit(id, field, value, t(`card.${field}`));
  };

  return (
    <>
      <Card style={available ? styles.card : styles.card__deactivated}>
        <Card.Content style={styles.card__title}>
          <TouchableRipple
            onPress={() => openEditModal('habitName', habitName)}>
            <Text variant="titleMedium">{habitName}</Text>
          </TouchableRipple>
          {!onboardingMode && (
            <View style={styles.card__options}>
              <IconButton
                icon="trash-can"
                onPress={() => setDeleteDialogVisible(true)}
              />
              <Switch
                value={isAvailable}
                onValueChange={handleToggleAvailable}
              />
            </View>
          )}
        </Card.Content>

        {available && (
          <Card.Content style={styles.card__container}>
            {!onboardingMode && (
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
            )}

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

            {!onboardingMode && (
              <>
                <View style={styles.gap} />

                <TouchableRipple
                  onPress={() => openEditModal('goodCounter', goodCounter)}>
                  <View style={styles.card__row}>
                    <IconButton
                      icon="plus-thick"
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
                      icon="minus-thick"
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
                      icon="close-thick"
                      size={18}
                      style={{margin: 0, marginRight: 4}}
                    />
                    <Text variant="bodyMedium">
                      {t('card.skipCounter')}: {skipCounter}
                    </Text>
                  </View>
                </TouchableRipple>
              </>
            )}
          </Card.Content>
        )}
      </Card>

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
