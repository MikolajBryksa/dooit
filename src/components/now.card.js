import React, {useEffect, useState} from 'react';
import {Card, Text, Chip, IconButton, ProgressBar} from 'react-native-paper';
import {View} from 'react-native';
import {updateHabit} from '@/services/habits.service';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import SkipDialog from '@/dialogs/skip.dialog';
import {useSelector} from 'react-redux';
import {
  formatHourString,
  getFormattedTime,
  calculateEndTime,
  calculateProgress,
  calculateTimeLeft,
} from '@/utils';

const NowCard = ({
  id,
  habitName,
  goodChoice,
  badChoice,
  score,
  level,
  duration,
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
  const clockFormat = useSelector(state => state.settings.clockFormat);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [skipDialogVisible, setSkipDialogVisible] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [currentTime, setCurrentTime] = useState(getFormattedTime(false));
  const [endTime, setEndTime] = useState();
  const [progressValue, setProgressValue] = useState(0);
  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    if (repeatHours && repeatHours.length > 0 && duration) {
      const calculatedEndTime = calculateEndTime(repeatHours[0], duration);
      setEndTime(calculatedEndTime);
    }
  }, [repeatHours, duration]);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getFormattedTime(false, true));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!endTime || !currentTime) return;

    const {progress, isFinished} = calculateProgress(
      currentTime,
      endTime,
      duration,
    );
    const timeLeft = calculateTimeLeft(currentTime, endTime);

    setProgressValue(progress);
    setRemainingTime(timeLeft);

    if (isFinished) {
      onChoice();
    }
  }, [currentTime, endTime, duration, onChoice]);

  const handleSkipHabit = () => {
    if (onChoice) {
      onChoice();
    }
  };

  const handleNextHabit = () => {
    saveChoice();
    setSelectedChoice(null);
    onChoice();
  };

  const handleGoodChoice = () => {
    setSelectedChoice('good');
  };

  const handleBadChoice = () => {
    setSelectedChoice('bad');
  };

  const saveChoice = () => {
    let newScore;
    if (selectedChoice === 'good') {
      newScore = score + 1;
    } else {
      newScore = Math.max(0, score - 1);
    }

    const isLastRepetition =
      originalRepeatHours.length > 0 &&
      repeatHours[0] === originalRepeatHours[originalRepeatHours.length - 1];

    let newLevel = level;
    if (isLastRepetition) {
      if (newScore == originalRepeatHours.length) {
        newLevel = level + 1;
      } else if (newScore == 0) {
        newLevel = level - 1;
      } else {
        newLevel = level;
      }
      newScore = 0;
    }

    updateHabit(
      id,
      habitName,
      goodChoice,
      badChoice,
      newScore,
      newLevel,
      duration,
      repeatDays,
      originalRepeatHours.length > 0 ? originalRepeatHours : repeatHours,
      available,
    );
    fetchHabits();
  };

  useEffect(() => {
    if (selectedChoice) {
      setProcessed(true);
    }
  }, [selectedChoice]);

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
                ? repeatHours
                    .map(h => formatHourString(h, clockFormat))
                    .join(', ')
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
              {t('card.score')}: {score} / {originalRepeatHours.length}
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
              icon="timer"
              size={18}
              style={{margin: 0, marginRight: 4}}
            />
            <Text variant="bodyMedium">
              {t('card.remaining')}: {remainingTime}
            </Text>
          </View>

          <ProgressBar
            progress={progressValue}
            style={{width: '100%', height: 6}}
          />
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
          {processed && (
            <Chip mode="outlined" onPress={handleNextHabit} style={styles.chip}>
              {t('card.finish')}
            </Chip>
          )}
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
