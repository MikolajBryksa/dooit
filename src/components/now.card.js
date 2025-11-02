import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {Text, Button, ProgressBar} from 'react-native-paper';
import {View, Animated} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {updateHabit} from '@/services/habits.service';
import {addHour, pickRandomMotivation} from '@/utils';
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
  onUpdated,
  globalProgressValue = 0,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const [step, setStep] = useState(1);
  const [isManuallyUnlocked, setIsManuallyUnlocked] = useState(false);
  const [motivation, setMotivation] = useState(
    pickRandomMotivation(t, 'notification'),
  );
  const [contentHeight, setContentHeight] = useState(0);

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

    // Animate container height from 0 to full when card appears
    if (isNext) {
      habitContainerHeight.setValue(0);
      Animated.timing(habitContainerHeight, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }
  }, [isNext, t]);

  const opacity = useRef(new Animated.Value(1)).current;
  const goodHabitOpacity = useRef(new Animated.Value(1)).current;
  const badHabitOpacity = useRef(new Animated.Value(0)).current;
  const habitContainerHeight = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animates opacity for the current card
    Animated.timing(opacity, {
      toValue: isNext ? 1 : 0.5,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [isNext, opacity]);

  useEffect(() => {
    // Animates transition between good and bad habit
    if (step === 1) {
      goodHabitOpacity.setValue(1);
      badHabitOpacity.setValue(0);
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
        Animated.timing(habitContainerHeight, {
          toValue: 0,
          duration: 600,
          delay: 100,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [step, goodHabitOpacity, badHabitOpacity, habitContainerHeight]);

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
      animatedStyle={{opacity}}
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
              indeterminate={isLocked}
            />
          </View>
          <Text variant="bodyLarge" style={styles.motivation__message}>
            {motivation}
          </Text>
        </>
      }
      buttonsContent={
        <Animated.View
          style={{
            width: '100%',
            overflow: 'hidden',
            height: habitContainerHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, contentHeight],
            }),
          }}>
          <View style={{position: 'relative', width: '100%'}}>
            {/* Good Habit - Step 1 */}
            <Animated.View
              style={[
                styles.card__choices,
                {
                  opacity: goodHabitOpacity,
                  position: 'absolute',
                  width: '100%',
                  top: 0,
                  left: 0,
                },
              ]}
              pointerEvents={step === 1 ? 'auto' : 'none'}
              onLayout={event => {
                const {height} = event.nativeEvent.layout;
                if (height > 0 && height !== contentHeight) {
                  setContentHeight(height);
                }
              }}>
              <Text variant="titleLarge">{habitName}</Text>
              {isLocked ? (
                <View style={styles.card__buttons}>
                  <Button
                    style={styles.button}
                    mode="contained"
                    icon="lock-open-variant"
                    onPress={() => {
                      handleUnlock();
                    }}>
                    {t('button.unlock')}
                  </Button>
                </View>
              ) : (
                <View style={styles.card__buttons}>
                  <Button
                    style={styles.button}
                    mode="outlined"
                    icon="close"
                    disabled={step !== 1}
                    onPress={() => {
                      skipGoodChoice();
                    }}>
                    {t('button.skip')}
                  </Button>
                  <Button
                    style={styles.button}
                    mode="contained"
                    icon="check"
                    disabled={step !== 1}
                    onPress={() => {
                      addGoodChoice();
                    }}>
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
                  position: 'absolute',
                  width: '100%',
                  top: 0,
                  left: 0,
                },
              ]}
              pointerEvents={step === 2 ? 'auto' : 'none'}>
              <Text variant="titleLarge">{habitEnemy}</Text>

              <View style={styles.card__buttons}>
                <Button
                  style={styles.button}
                  mode="outlined"
                  icon="close"
                  onPress={() => {
                    skipBadChoice();
                  }}>
                  {t('button.skip')}
                </Button>
                <Button
                  style={styles.button__bad}
                  mode="contained"
                  icon="check"
                  onPress={() => {
                    addBadChoice();
                  }}>
                  {t('button.done')}
                </Button>
              </View>
            </Animated.View>
          </View>
        </Animated.View>
      }
    />
  );
};

export default NowCard;
