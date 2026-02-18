import React, {useState, useEffect, useRef, useMemo} from 'react';
import {
  Card,
  Text,
  Switch,
  IconButton,
  TouchableRipple,
} from 'react-native-paper';
import {View, Animated} from 'react-native';
import GradientCard from './gradient.card';
import {updateHabitValue} from '@/services/habits.service';
import DeleteHabitDialog from '@/dialogs/delete-habit.dialog';
import HistoryModal from '@/modals/history.modal';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useSelector} from 'react-redux';
import {formatHourString} from '@/utils';
import {calculateEffectiveness} from '@/services/executions.service';
import {logError} from '@/services/errors.service';

const HabitCard = ({
  id,
  habitName,
  repeatDays = [],
  repeatHours = [],
  available,
  icon,
  fetchAllHabits,
  onEdit,
  onboardingMode = false,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const clockFormat = useSelector(state => state.settings.clockFormat);
  const firstDay = useSelector(state => state.settings.firstDay);
  const [isAvailable, setIsAvailable] = useState(available);
  const [deleteHabitDialogVisible, setDeleteHabitDialogVisible] =
    useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const stats = useMemo(() => {
    try {
      return calculateEffectiveness(id, {id, repeatDays, repeatHours});
    } catch (error) {
      logError(error, 'calculateEffectiveness');
      return {
        effectiveness: null,
        totalCount: 0,
        goodCount: 0,
        badCount: 0,
      };
    }
  }, [id, repeatDays, repeatHours]);

  const contentHeight = useRef(new Animated.Value(available ? 1 : 0)).current;
  const cardOpacity = useRef(new Animated.Value(available ? 1 : 0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentHeight, {
        toValue: isAvailable ? 1 : 0,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(cardOpacity, {
        toValue: isAvailable ? 1 : 0.5,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isAvailable]);

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
      <GradientCard>
        <Animated.View style={{opacity: cardOpacity}}>
            <Card.Content style={styles.card__header}>
            <View style={styles.card__headerLeft}>
              <TouchableRipple
                style={{flex: 1}}
                onPress={() => openEditModal('habitName', habitName)}>
                <View style={styles.card__row}>
                  <IconButton
                    icon={icon || 'infinity'}
                    size={18}
                    style={{margin: 0, marginRight: 4}}
                  />
                  <Text
                    variant="bodyMedium"
                    style={styles.card__headerTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {habitName}
                  </Text>
                </View>
              </TouchableRipple>
            </View>

            {!onboardingMode && (
              <View style={styles.card__headerRight}>
                <IconButton
                  icon="trash-can"
                  onPress={() => setDeleteHabitDialogVisible(true)}
                  size={18}
                  style={{margin: 0}}
                />
                <Switch
                  value={isAvailable}
                  onValueChange={handleToggleAvailable}
                />
              </View>
            )}
          </Card.Content>
        </Animated.View>

        <Animated.View
          style={{
            overflow: 'hidden',
            height: onboardingMode
              ? 'auto'
              : contentHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 115],
                }),
            marginBottom: !onboardingMode ? 0 : 15,
            opacity: onboardingMode ? 1 : cardOpacity,
          }}>
          <Card.Content style={styles.card__list}>
            <View style={styles.card__divider} />
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
                    style={{maxWidth: '100%', flexShrink: 1}}
                    numberOfLines={1}
                    ellipsizeMode="tail">
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
              <TouchableRipple
                onPress={() =>
                  stats.effectiveness !== null && setHistoryModalVisible(true)
                }>
                <View style={styles.card__row}>
                  <IconButton
                    icon="chart-arc"
                    size={18}
                    style={{margin: 0, marginRight: 4}}
                  />
                  <Text variant="bodyMedium">
                    {stats.effectiveness !== null
                      ? `${stats.effectiveness}% (${stats.goodCount}/${stats.totalCount})`
                      : t('card.noRepetitions')}
                  </Text>
                </View>
              </TouchableRipple>
            )}
          </Card.Content>
        </Animated.View>
      </GradientCard>

      <DeleteHabitDialog
        visible={deleteHabitDialogVisible}
        onDismiss={() => setDeleteHabitDialogVisible(false)}
        onDone={() => {
          setDeleteHabitDialogVisible(false);
          fetchAllHabits();
        }}
        habitId={id}
        habitName={habitName}
      />

      <HistoryModal
        visible={historyModalVisible}
        onDismiss={() => {
          setHistoryModalVisible(false);
          fetchAllHabits();
        }}
        habitId={id}
        habitName={habitName}
      />
    </>
  );
};

export default HabitCard;
