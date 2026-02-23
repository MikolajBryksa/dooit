import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {Text, Button} from 'react-native-paper';
import {View, Animated} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {updateHabit} from '@/services/habits.service';
import {pickRandomMotivation, getLocalDateKey} from '@/utils';
import {useCurrentTime} from '@/hooks';
import PieCircle from '../circles/pie.circle';
import NowComponent from '../components/now.component';
import {
  addExecution,
  hasExecution,
  calculateEffectiveness,
} from '@/services/executions.service';

const NowCard = ({
  id,
  habitName,
  goodCounter,
  badCounter,
  repeatDays,
  repeatHours,
  selectedHour,
  icon,
  isNext = false,
  isLastHabit = false,
  onUpdated,
  onNext,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const [step, setStep] = useState(1);
  const [isManuallyUnlocked, setIsManuallyUnlocked] = useState(false);
  const [hasUserMadeChoice, setHasUserMadeChoice] = useState(false);
  const [choice, setChoice] = useState(null);
  const [motivation, setMotivation] = useState(
    pickRandomMotivation(t, 'notification'),
  );

  // Card fade-in animation
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const currentTime = useCurrentTime();
  const isSelectedHourLater = useMemo(() => {
    // Comparison of selectedHour with the current time
    if (!selectedHour || !currentTime) return false;
    const [h, m] = selectedHour.split(':').map(Number);
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const selMinutes = h * 60 + (m || 0);
    return selMinutes > nowMinutes;
  }, [selectedHour, currentTime]);

  const isLocked = isSelectedHourLater && !isManuallyUnlocked;

  useEffect(() => {
    // Resets the step and motivation when the card changes
    setStep(1);
    setIsManuallyUnlocked(false);
    setHasUserMadeChoice(false);
    setMotivation(pickRandomMotivation(t, 'notification'));

    // Fade in the new card
    cardOpacity.setValue(0);
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [id, selectedHour, t, cardOpacity]);

  const today = getLocalDateKey();
  const isCompleted = hasExecution(id, today, selectedHour);

  const stats = useMemo(() => {
    return calculateEffectiveness(id, {
      id,
      repeatDays,
      repeatHours,
    });
  }, [id, repeatDays, repeatHours]);

  const choiceLabel = useMemo(() => {
    if (choice === 'good') return t('button.done');
    if (choice === 'bad') return t('button.skipped');
    return t('button.done');
  }, [choice, t]);

  const addGoodChoice = () => {
    setChoice('good');
    setMotivation(pickRandomMotivation(t, 'good'));
    handleChoice('good');
    setStep(2);
  };

  const addBadChoice = () => {
    setChoice('bad');
    setMotivation(pickRandomMotivation(t, 'bad'));
    handleChoice('bad');
    setStep(2);
  };

  const handleUnlock = () => {
    setIsManuallyUnlocked(true);
  };

  const handleNext = () => {
    onNext?.();
  };

  const handleChoice = useCallback(
    choice => {
      if (isCompleted) return;

      const today = getLocalDateKey();

      if (!hasExecution(id, today, selectedHour)) {
        addExecution(id, today, selectedHour, choice);
      }

      const patch = {
        habitName,
        repeatDays,
        repeatHours,
      };

      if (choice === 'good') patch.goodCounter = (goodCounter || 0) + 1;
      if (choice === 'bad') patch.badCounter = (badCounter || 0) + 1;

      updateHabit(id, patch);
      setHasUserMadeChoice(true);
      onUpdated?.();
    },
    [
      isCompleted,
      selectedHour,
      habitName,
      repeatDays,
      repeatHours,
      goodCounter,
      badCounter,
      id,
      onUpdated,
    ],
  );

  if (!isNext) {
    return null;
  }

  return (
    <NowComponent
      animatedStyle={{opacity: cardOpacity}}
      iconContent={
        <PieCircle
          icon={icon}
          effectiveness={stats.effectiveness}
          totalCount={stats.totalCount}
          goodCount={stats.goodCount}
          badCount={stats.badCount}
          opacity={isLocked ? 0.5 : 1}
          showPercentage={isCompleted || hasUserMadeChoice}
        />
      }
      subtitleContent={
        <Text variant="titleMedium">
          {step === 1 ? selectedHour : motivation}
        </Text>
      }
      titleContent={
        <Text variant="titleLarge" numberOfLines={2}>
          {step === 1 ? habitName : choiceLabel}
        </Text>
      }
      buttonsContent={
        <>
          {step === 1 ? (
            isLocked ? (
              <Button
                style={styles.button}
                mode="contained"
                icon="lock-open-variant"
                onPress={handleUnlock}>
                {t('button.unlock')}
              </Button>
            ) : (
              <View style={styles.card__buttons}>
                <Button
                  style={styles.button}
                  mode="outlined"
                  icon="close"
                  onPress={addBadChoice}>
                  {t('button.skip')}
                </Button>
                <Button
                  style={styles.button__good}
                  mode="contained"
                  icon="check"
                  onPress={addGoodChoice}>
                  {t('button.done')}
                </Button>
              </View>
            )
          ) : (
            <Button
              style={styles.button}
              mode="contained"
              icon={isLastHabit ? 'check' : 'arrow-right'}
              onPress={handleNext}>
              {isLastHabit ? t('button.finish') : t('button.next')}
            </Button>
          )}
        </>
      }
    />
  );
};

export default NowCard;
