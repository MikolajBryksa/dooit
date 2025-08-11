import React, {useEffect, useState} from 'react';
import {Card, Text, Chip, IconButton, ProgressBar} from 'react-native-paper';
import {View} from 'react-native';
import {updateHabit} from '@/services/habits.service';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import SkipDialog from '@/dialogs/skip.dialog';
import {useSelector} from 'react-redux';
import PieChart from '@/components/pie.chart';
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
  const [currentTime, setCurrentTime] = useState(getFormattedTime(false));
  const [endTime, setEndTime] = useState();
  const [progressValue, setProgressValue] = useState(0);
  const [remainingTime, setRemainingTime] = useState('');
  const [displayScore, setDisplayScore] = useState(score);
  const [displayLevel, setDisplayLevel] = useState(level);

  useEffect(() => {
    if (duration) {
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

  useEffect(() => {
    setDisplayScore(score);
    setDisplayLevel(level);
  }, [score, level]);

  const handleSkipHabit = () => {
    if (onChoice) {
      onChoice();
    }
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
    setDisplayScore(newScore);

    const isLastRepetition =
      originalRepeatHours.length > 0 &&
      repeatHours[0] === originalRepeatHours[originalRepeatHours.length - 1];

    let newLevel = level;
    if (isLastRepetition) {
      const levelUpThreshold = Math.ceil(originalRepeatHours.length / 2);

      if (newScore >= levelUpThreshold && level < 999) {
        newLevel = Math.min(999, level + 1);
      } else if (newScore === 0 && level > 0) {
        newLevel = Math.max(0, level - 1);
      }

      setDisplayLevel(newLevel);
    } else {
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
    }
    return {newScore, newLevel, isLastRepetition};
  };

  useEffect(() => {
    if (selectedChoice) {
      const result = saveChoice();

      if (result && result.isLastRepetition) {
        setTimeout(() => {
          updateHabit(
            id,
            habitName,
            goodChoice,
            badChoice,
            0,
            result.newLevel,
            duration,
            repeatDays,
            originalRepeatHours.length > 0 ? originalRepeatHours : repeatHours,
            available,
          );
          fetchHabits();

          setSelectedChoice(null);
          onChoice();
        }, 1800);
      } else {
        setTimeout(() => {
          setSelectedChoice(null);
          onChoice();
        }, 1800);
      }
    }
  }, [selectedChoice]);

  return (
    <>
      <Card style={active ? styles.card : styles.card__deactivated}>
        <Card.Content style={styles.card__center}>
          <Text variant="titleMedium">{habitName}</Text>
          {/* <View style={styles.card__options}>
            <IconButton
              icon="close"
              onPress={() => setSkipDialogVisible(true)}
            />
          </View> */}
        </Card.Content>

        <Card.Content style={styles.card__center}>
          <View style={[styles.card__row, styles.pieChartContainer]}>
            <PieChart
              score={displayScore}
              max={originalRepeatHours.length || 1}
              level={displayLevel}
              label={t('card.level')}
              size={100}
            />
          </View>

          <View style={styles.card__center}>
            {!active ? (
              <Text variant="bodyMedium">
                {t('card.begin')}:{' '}
                {repeatHours
                  .map(h => formatHourString(h, clockFormat))
                  .join(', ')}
              </Text>
            ) : (
              <Text variant="bodyMedium">
                {t('card.remaining')}: {remainingTime}
              </Text>
            )}
          </View>

          <View
            style={{
              width: '100%',
            }}>
            <ProgressBar
              progress={progressValue}
              style={{height: 6, borderRadius: 4}}
            />
          </View>
        </Card.Content>
        <View style={styles.gap} />
        <Card.Content style={styles.card__buttons}>
          <>
            <Chip
              mode="outlined"
              selected={selectedChoice === 'bad'}
              onPress={handleBadChoice}
              disabled={selectedChoice === 'good'}
              style={styles.chip__button}>
              {badChoice}
            </Chip>
            <Chip
              mode="outlined"
              selected={selectedChoice === 'good'}
              onPress={handleGoodChoice}
              disabled={selectedChoice === 'bad'}
              style={styles.chip__button}>
              {goodChoice}
            </Chip>
          </>
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
