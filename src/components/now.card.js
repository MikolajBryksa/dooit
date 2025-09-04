import React, {useCallback, useState, useMemo, useEffect, useRef} from 'react';
import {Card, Text, Button, ProgressBar} from 'react-native-paper';
import {View, Animated} from 'react-native';
import {updateHabit} from '@/services/habits.service';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useSelector} from 'react-redux';
import {addHour, pickRandomMotivation} from '@/utils';
import PieChart from './pie.chart';

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
  const debugMode = useSelector(state => state.settings.debugMode);
  const [step, setStep] = useState(1);
  const [motivation, setMotivation] = useState(
    pickRandomMotivation(t, 'notification'),
  );

  useEffect(() => {
    // Resets the step and motivation when the card changes
    setStep(1);
    setMotivation(pickRandomMotivation(t, 'notification'));
  }, [isNext]);

  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    // Animates opacity for the current card
    Animated.timing(opacity, {
      toValue: isNext ? 1 : 0.5,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [isNext, opacity]);

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
    const planned = new Set(repeatHours || []);
    const done = new Set((completedHours || []).filter(h => planned.has(h)))
      .size;

    const value = done / repeatHours?.length;
    return Math.max(0, Math.min(1, value));
  }, [repeatHours, completedHours]);

  if (!isNext && !debugMode) {
    return null;
  }

  return (
    <Card
      style={[
        styles.card,
        debugMode && isCompleted && styles.card__deactivated,
        debugMode && isNext && styles.card__selected,
      ]}>
      <Animated.View style={{opacity}}>
        <Card.Content style={styles.card__center}>
          <View style={styles.gap} />
          {/* Counter */}
          <PieChart
            size={120}
            strokeWidth={12}
            icon={icon}
            good={goodCounter}
            bad={badCounter}
            skip={skipCounter}
          />
          <View style={styles.gap} />
          <View style={styles.gap} />
          {/* Time */}
          <Text variant="bodyLarge">{selectedHour}</Text>
          <View style={styles.progress__container}>
            <ProgressBar
              style={styles.progress__bar}
              progress={progressBarValue}
            />
          </View>
          <Text variant="bodyLarge">{motivation}</Text>
          <View style={styles.gap} />
          <View style={styles.gap} />

          <View style={[styles.card__choices, step !== 1 && {opacity: 0.5}]}>
            {/* Good */}
            <Text variant="titleLarge">{habitName}</Text>
            <Card.Content style={styles.card__buttons}>
              <Button
                style={styles.button}
                mode="outlined"
                onPress={() => {
                  skipGoodChoice();
                }}>
                {t('button.skip')}
              </Button>
              <Button
                style={styles.button}
                mode="contained"
                onPress={() => {
                  addGoodChoice();
                }}>
                {t('button.done')}
              </Button>
            </Card.Content>
          </View>

          <Text variant="bodyLarge">{t('card.instead')}</Text>

          <View style={[styles.card__choices, step !== 2 && {opacity: 0.5}]}>
            {/* Bad */}
            <Text variant="titleLarge">{habitEnemy}</Text>
            <Card.Content style={styles.card__buttons}>
              <Button
                style={styles.button}
                mode="outlined"
                onPress={() => {
                  skipBadChoice();
                }}>
                {t('button.skip')}
              </Button>
              <Button
                style={step === 2 ? styles.button__bad : styles.button}
                mode="contained"
                disabled={step !== 2}
                onPress={() => {
                  addBadChoice();
                }}>
                {t('button.done')}
              </Button>
            </Card.Content>
            <View style={styles.gap} />
          </View>
        </Card.Content>
      </Animated.View>
      <View style={styles.gap} />
    </Card>
  );
};

export default NowCard;
