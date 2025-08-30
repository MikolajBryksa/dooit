import React, {useCallback, useMemo} from 'react';
import {Card, Text, IconButton, Avatar} from 'react-native-paper';
import {View} from 'react-native';
import {updateHabit} from '@/services/habits.service';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useSelector} from 'react-redux';
import {formatHourString} from '@/utils';

const NowCard = ({
  id,
  habitName,
  habitEnemy,
  goodCounter,
  badCounter,
  skipCounter,
  repeatDays,
  repeatHours,
  completedHours = [],
  selectedHour,
  icon,
  isNext = false,
  onUpdated,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const clockFormat = useSelector(state => state.settings.clockFormat);

  const isCompleted = useMemo(() => {
    return (
      Array.isArray(completedHours) && completedHours.includes(selectedHour)
    );
  }, [completedHours, selectedHour]);

  const addHour = (list, hour) => Array.from(new Set([...(list || []), hour]));

  const handleChoice = useCallback(
    choice => {
      if (isCompleted) return;

      const nextCompleted = addHour(completedHours, selectedHour);
      const patch = {
        habitName,
        habitEnemy,
        repeatDays,
        repeatHours,
        completedHours: nextCompleted,
      };

      if (choice === 'good') patch.goodCounter = (goodCounter || 0) + 1;
      if (choice === 'bad') patch.badCounter = (badCounter || 0) + 1;
      if (choice === 'skip') patch.skipCounter = (skipCounter || 0) + 1;

      updateHabit(id, patch);
      onUpdated?.();
    },
    [
      isCompleted,
      completedHours,
      selectedHour,
      habitName,
      habitEnemy,
      repeatDays,
      repeatHours,
      goodCounter,
      badCounter,
      skipCounter,
      id,
      onUpdated,
    ],
  );

  const containerStyle = [
    !isCompleted ? styles.card : styles.card__deactivated,
    isNext && !isCompleted && styles.card__selected,
  ];

  return (
    <Card style={containerStyle}>
      <Card.Content style={styles.card__center}>
        <Avatar.Icon icon={icon} size={36} />
        <View style={styles.gap} />

        <Text variant="bodyMedium">
          {goodCounter} {t('done.good', {defaultValue: habitName})}
        </Text>
        <Text variant="bodyMedium">
          {badCounter} {t('done.bad', {defaultValue: habitEnemy})}
        </Text>
        <Text variant="bodyMedium">
          {skipCounter} {t('done.skipped', {defaultValue: 'Skipped'})}
        </Text>

        <Card.Content style={styles.card__buttons}>
          <IconButton
            icon="thumb-up"
            disabled={isCompleted}
            onPress={() => handleChoice('good')}
          />
          <IconButton
            icon="thumb-down"
            disabled={isCompleted}
            onPress={() => handleChoice('bad')}
          />
          <IconButton
            icon="close"
            disabled={isCompleted}
            onPress={() => handleChoice('skip')}
          />
        </Card.Content>

        <View style={styles.gap} />
        <Text variant="bodyLarge">{selectedHour}</Text>
        <Text variant="bodyMedium">
          {repeatHours.map(h => formatHourString(h, clockFormat)).join(', ')}
        </Text>
      </Card.Content>
      <View style={styles.gap} />
    </Card>
  );
};

export default NowCard;
