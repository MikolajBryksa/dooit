import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {Text, Button, ProgressBar} from 'react-native-paper';
import {View, ScrollView, Animated} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {updateHabit} from '@/services/habits.service';
import {pickRandomMotivation} from '@/utils';
import {useCurrentTime} from '@/hooks';
import PieCircle from './pie.circle';
import MainCard from './main.card';

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
  isLastHabit = false,
  onUpdated,
  onNext,
  globalProgressValue = 0,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const [step, setStep] = useState(1);
  const [isManuallyUnlocked, setIsManuallyUnlocked] = useState(false);
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
    setMotivation(pickRandomMotivation(t, 'notification'));

    // Fade in the new card
    cardOpacity.setValue(0);
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [id, selectedHour, t, cardOpacity]);

  const goodHabitOpacity = useRef(new Animated.Value(1)).current;
  const badHabitOpacity = useRef(new Animated.Value(0)).current;
  const nextButtonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animates transition between good habit, bad habit, and next button
    if (step === 1) {
      Animated.parallel([
        Animated.timing(goodHabitOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(badHabitOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(nextButtonOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (step === 2) {
      Animated.parallel([
        Animated.timing(goodHabitOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(badHabitOpacity, {
          toValue: 1,
          duration: 300,
          delay: 150,
          useNativeDriver: true,
        }),
        Animated.timing(nextButtonOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (step === 3) {
      Animated.parallel([
        Animated.timing(goodHabitOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(badHabitOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(nextButtonOpacity, {
          toValue: 1,
          duration: 300,
          delay: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [step, goodHabitOpacity, badHabitOpacity, nextButtonOpacity]);

  const isCompleted = useMemo(() => {
    return completedHours.includes(selectedHour);
  }, [completedHours, selectedHour]);

  const addGoodChoice = () => {
    setMotivation(pickRandomMotivation(t, 'good'));
    handleChoice('good');
    setStep(3);
  };

  const skipGoodChoice = () => {
    setStep(2);
  };

  const addBadChoice = () => {
    setMotivation(pickRandomMotivation(t, 'bad'));
    handleChoice('bad');
    setStep(3);
  };

  const skipBadChoice = () => {
    setMotivation(pickRandomMotivation(t, 'skip'));
    handleChoice('skip');
    setStep(3);
  };

  const handleUnlock = () => {
    setIsManuallyUnlocked(true);
  };

  const handleNext = () => {
    onNext?.();
  };

  function addHour(list, hour) {
    return Array.from(new Set([...(list || []), hour]));
  }

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

  const progressBarValue = useMemo(() => {
    return Math.max(0, Math.min(1, globalProgressValue));
  }, [globalProgressValue]);

  if (!isNext) {
    return null;
  }

  return (
    <MainCard
      animatedStyle={{opacity: cardOpacity}}
      iconContent={
        <PieCircle
          size={120}
          strokeWidth={12}
          icon={icon}
          good={goodCounter}
          bad={badCounter}
          skip={skipCounter}
          opacity={isLocked ? 0.5 : 1}
        />
      }
      progressContent={
        <>
          <Text variant="titleLarge">{selectedHour}</Text>
          <View style={styles.progress__container}>
            <ProgressBar
              style={styles.progress__bar}
              progress={progressBarValue}
              indeterminate={!isLocked && step !== 3}
            />
          </View>
        </>
      }
      buttonsContent={
        <View style={{width: '100%', position: 'relative'}}>
          {/* Good Habit - Step 1 */}
          <Animated.View
            style={[
              styles.card__choices,
              {
                opacity: goodHabitOpacity,
                position: step === 1 ? 'relative' : 'absolute',
                width: '100%',
                top: 0,
                left: 0,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
            pointerEvents={step === 1 ? 'auto' : 'none'}>
            <View style={styles.card__choicesTitleContainer}>
              <Text variant="titleLarge">{habitName}</Text>
            </View>
            {isLocked ? (
              <View style={styles.card__buttons}>
                <Button
                  style={styles.button}
                  mode="contained"
                  icon="lock-open-variant"
                  onPress={handleUnlock}>
                  {t('button.unlock')}
                </Button>
              </View>
            ) : (
              <View style={styles.card__buttons}>
                <Button
                  style={styles.button}
                  mode="outlined"
                  icon="close"
                  onPress={skipGoodChoice}>
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
            )}
          </Animated.View>

          {/* Bad Habit - Step 2 */}
          <Animated.View
            style={[
              styles.card__choices,
              {
                opacity: badHabitOpacity,
                position: step === 2 ? 'relative' : 'absolute',
                width: '100%',
                top: 0,
                left: 0,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
            pointerEvents={step === 2 ? 'auto' : 'none'}>
            <View style={styles.card__choicesTitleContainer}>
              <Text variant="titleLarge">{habitEnemy}</Text>
            </View>
            <View style={styles.card__buttons}>
              <Button
                style={styles.button}
                mode="outlined"
                icon="close"
                onPress={skipBadChoice}>
                {t('button.skip')}
              </Button>
              <Button
                style={styles.button__bad}
                mode="contained"
                icon="check"
                onPress={addBadChoice}>
                {t('button.done')}
              </Button>
            </View>
          </Animated.View>

          {/* Next Button - Step 3 */}
          <Animated.View
            style={[
              styles.card__choices,
              {
                opacity: nextButtonOpacity,
                position: step === 3 ? 'relative' : 'absolute',
                width: '100%',
                top: 0,
                left: 0,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
            pointerEvents={step === 3 ? 'auto' : 'none'}>
            <View style={styles.card__choicesTitleContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text variant="titleMedium" style={{minWidth: '100%'}}>
                  {motivation}
                </Text>
              </ScrollView>
            </View>
            <View style={styles.card__buttons}>
              <Button
                style={styles.button}
                mode="contained"
                icon={isLastHabit ? 'check' : 'arrow-right'}
                onPress={handleNext}>
                {isLastHabit ? t('button.finish') : t('button.next')}
              </Button>
            </View>
          </Animated.View>
        </View>
      }
    />
  );
};

export default NowCard;
