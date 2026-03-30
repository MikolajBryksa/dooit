import React, {useState, useEffect, useRef, useMemo} from 'react';
import {Card, Text, IconButton, TouchableRipple} from 'react-native-paper';
import {View, Animated} from 'react-native';
import DeleteHabitDialog from '@/dialogs/delete-habit.dialog';
import HistoryModal from '@/modals/history.modal';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useSelector} from 'react-redux';
import {formatHourString} from '@/utils';
import {getGoalStats} from '@/services/habits.service';
import {logError} from '@/services/errors.service';

const CONTENT_HEIGHT = 150;

const HabitComponent = ({
  id,
  habitName,
  goodCounter = 0,
  badCounter = 0,
  repeatDays = [],
  repeatHours = [],
  icon,
  goal,
  fetchAllHabits,
  onEdit,
  onboardingMode = false,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const clockFormat = useSelector(state => state.settings.clockFormat);
  const firstDay = useSelector(state => state.settings.firstDay);

  const [isExpanded, setIsExpanded] = useState(onboardingMode);
  const [deleteHabitDialogVisible, setDeleteHabitDialogVisible] =
    useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const stats = useMemo(() => {
    try {
      return getGoalStats({
        id,
        goal,
      });
    } catch (error) {
      logError(error, 'getGoalStats');
      return {
        goalCount: 0,
        goodCount: 0,
        badCount: 0,
        remainingCount: 0,
        progressPercent: null,
      };
    }
  }, [id, goodCounter, badCounter, repeatDays, repeatHours, goal]);

  const expandAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, expandAnim]);

  const toggleExpanded = () => {
    if (onboardingMode) return;
    setIsExpanded(v => !v);
  };

  const openEditModal = (field, value) => {
    onEdit(id, field, value, t(`card.${field}`));
  };

  const animatedHeight = onboardingMode
    ? 'auto'
    : expandAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, CONTENT_HEIGHT],
      });

  const chevronRotation = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handleCardPressWhenCollapsed = () => {
    if (onboardingMode) return;
    if (!isExpanded) setIsExpanded(true);
  };

  const handleTitlePress = () => {
    if (!isExpanded) return;
    openEditModal('habitName', habitName);
  };

  return (
    <>
      <TouchableRipple
        borderless={false}
        onPress={handleCardPressWhenCollapsed}
        disabled={onboardingMode || isExpanded}
        style={styles.card}>
        <View>
          <Card.Content style={styles.card__header}>
            <View style={styles.card__headerLeft}>
              <TouchableRipple
                style={{flex: 1}}
                onPress={handleTitlePress}
                disabled={!isExpanded}>
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
                {isExpanded && (
                  <IconButton
                    icon="trash-can"
                    onPress={() => setDeleteHabitDialogVisible(true)}
                    size={18}
                    style={{margin: 0}}
                  />
                )}

                <Animated.View style={{transform: [{rotate: chevronRotation}]}}>
                  <IconButton
                    icon="chevron-down"
                    onPress={toggleExpanded}
                    size={22}
                    style={{margin: 0}}
                  />
                </Animated.View>
              </View>
            )}
          </Card.Content>

          <Animated.View
            style={{
              overflow: 'hidden',
              height: animatedHeight,
              marginBottom: !onboardingMode ? 0 : 15,
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
                      )
                        return t('date.daily');
                      if (
                        sortedDays.length === 5 &&
                        workdays.every(day => sortedDays.includes(day))
                      )
                        return t('date.workdays');
                      if (
                        sortedDays.length === 2 &&
                        weekend.every(day => sortedDays.includes(day))
                      )
                        return t('date.weekend');

                      return sortedDays.map(day => t(`date.${day}`)).join(', ');
                    })()}
                  </Text>
                </View>
              </TouchableRipple>

              {!onboardingMode && (
                <>
                  <TouchableRipple
                    onPress={() =>
                      stats.goalCount > 0 && setHistoryModalVisible(true)
                    }>
                    <View style={styles.card__row}>
                      <IconButton
                        icon="chart-arc"
                        size={18}
                        style={{margin: 0, marginRight: 4}}
                        opacity={stats.goalCount > 0 ? 1 : 0.5}
                      />
                      <Text
                        variant="bodyMedium"
                        opacity={stats.goalCount > 0 ? 1 : 0.5}>
                        {stats.goalCount > 0
                          ? `${stats.goodCount} (${stats.progressPercent}%)`
                          : t('card.noRepetitions')}
                      </Text>
                    </View>
                  </TouchableRipple>

                  <TouchableRipple onPress={() => openEditModal('goal', goal)}>
                    <View style={styles.card__row}>
                      <IconButton
                        icon="flag-checkered"
                        size={18}
                        style={{margin: 0, marginRight: 4}}
                      />
                      <Text variant="bodyMedium">
                        {goal} {t('card.repetitions')}
                      </Text>
                    </View>
                  </TouchableRipple>
                </>
              )}
            </Card.Content>
          </Animated.View>
        </View>
      </TouchableRipple>

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

export default HabitComponent;
