import React, {useState} from 'react';
import {Card, Text, Chip, IconButton} from 'react-native-paper';
import {View} from 'react-native';
import {updateHabit} from '@/services/habits.service';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import SkipDialog from '@/dialogs/skip.dialog';

const NowCard = ({
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
  originalRepeatHours = [],
  available,
  fetchHabits,
  onChoice,
  active,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [skipDialogVisible, setSkipDialogVisible] = useState(false);
  const LEVEL_THRESHOLDS = [3, 7, 14, 31, 60, 90, 120, 180, 270, 365];

  const handleGoodChoice = () => {
    let newScore = score + 1;
    let newLevel = level;
    const newCurrentStreak = currentStreak + 1;

    const nextLevelThreshold =
      LEVEL_THRESHOLDS[level - 1] ||
      LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    if (newScore >= nextLevelThreshold) {
      newLevel = level + 1;
    }

    setSelectedChoice('good');

    updateHabit(
      id,
      habitName,
      goodChoice,
      badChoice,
      newScore,
      newLevel,
      newCurrentStreak,
      desc,
      message,
      repeatDays,
      originalRepeatHours.length > 0 ? originalRepeatHours : repeatHours,
      available,
    );
    fetchHabits();

    if (onChoice) {
      setTimeout(() => {
        onChoice();
      }, 500);
    }
  };

  const handleBadChoice = () => {
    const newScore = Math.max(0, score - 1);
    const newCurrentStreak = 0;

    setSelectedChoice('bad');

    updateHabit(
      id,
      habitName,
      goodChoice,
      badChoice,
      newScore,
      level,
      newCurrentStreak,
      desc,
      message,
      repeatDays,
      originalRepeatHours.length > 0 ? originalRepeatHours : repeatHours,
      available,
    );
    fetchHabits();

    if (onChoice) {
      setTimeout(() => {
        onChoice();
      }, 500);
    }
  };

  const handleSkipHabit = () => {
    if (onChoice) {
      onChoice();
    }
  };

  return (
    <>
      <Card style={active ? styles.card : styles.card__deactivated}>
        <Card.Content style={styles.card__title}>
          <Text variant="titleMedium">{habitName}</Text>
          <View style={styles.card__options}>
            <IconButton
              icon="close"
              onPress={() => setSkipDialogVisible(true)}
            />
          </View>
        </Card.Content>

        <Card.Content style={styles.card__container}>
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

          <View style={styles.card__row}>
            <IconButton
              icon="chart-line"
              size={18}
              style={{margin: 0, marginRight: 4}}
            />
            <Text variant="bodyMedium">
              {t('card.score')}: {score} /{' '}
              {LEVEL_THRESHOLDS[level - 1] ||
                LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]}
            </Text>
          </View>

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

          {desc && (
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
          )}

          {message && (
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
          )}
        </Card.Content>
        <View style={styles.gap} />
        <Card.Content style={styles.card__buttons}>
          <Chip
            mode="outlined"
            selected={selectedChoice === 'bad'}
            onPress={handleBadChoice}
            style={styles.chip}>
            {badChoice}
          </Chip>
          <Chip
            mode="outlined"
            selected={selectedChoice === 'good'}
            onPress={handleGoodChoice}
            style={styles.chip}>
            {goodChoice}
          </Chip>
        </Card.Content>
      </Card>

      <SkipDialog
        visible={skipDialogVisible}
        onDismiss={() => setSkipDialogVisible(false)}
        onDone={() => {
          setSkipDialogVisible(false);
        }}
        handleSkipHabit={handleSkipHabit}
        habitName={habitName}
      />
    </>
  );
};

export default NowCard;
