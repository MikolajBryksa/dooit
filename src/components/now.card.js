import React, {useCallback, useState, useMemo, useEffect} from 'react';
import {Card, Text, Button, ProgressBar} from 'react-native-paper';
import {View} from 'react-native';
import {updateHabit} from '@/services/habits.service';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useSelector} from 'react-redux';
import {addHour} from '@/utils';
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
  const [motivation, setMotivation] = useState('');

  useEffect(() => {
    setStep(1);
    setMotivation('');
  }, [isNext]);

  const isCompleted = useMemo(() => {
    return completedHours.includes(selectedHour);
  }, [completedHours, selectedHour]);

  const pickMotivation = useCallback(
    kind => {
      const pool = t(`motivation.${kind}`, {returnObjects: true});
      const arr = Array.isArray(pool) ? pool : [];
      if (!arr.length) return '';
      const idx = Math.floor(Math.random() * arr.length);
      return arr[idx];
    },
    [t],
  );

  const addGoodChoice = () => {
    setMotivation(pickMotivation('good'));
    handleChoice('good');
    setStep(3);
  };

  const skipGoodChoice = () => {
    setStep(2);
  };

  const addBadChoice = () => {
    setMotivation(pickMotivation('bad'));
    handleChoice('bad');
    setStep(3);
  };

  const skipBadChoice = () => {
    setMotivation(pickMotivation('skip'));
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

  if (!isNext && !debugMode) {
    return null;
  }

  const progressBarValue = useMemo(() => {
    const planned = new Set(repeatHours || []);
    const done = new Set((completedHours || []).filter(h => planned.has(h)))
      .size;

    const value = done / repeatHours?.length;
    return Math.max(0, Math.min(1, value));
  }, [repeatHours, completedHours]);

  return (
    <Card
      style={[
        styles.card,
        debugMode && isCompleted && styles.card__deactivated,
        debugMode && isNext && styles.card__selected,
      ]}>
      <Card.Content style={styles.card__center}>
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
        {/* Time */}
        <Text variant="bodyLarge">{selectedHour}</Text>
        <View style={styles.progress__container}>
          <ProgressBar
            style={styles.progress__bar}
            progress={progressBarValue}
          />
        </View>
        <View style={styles.gap} />

        {step === 1 && (
          <>
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
          </>
        )}

        {step === 2 && (
          <>
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
                style={styles.button}
                mode="contained"
                onPress={() => {
                  addBadChoice();
                }}>
                {t('button.done')}
              </Button>
            </Card.Content>
          </>
        )}

        {step === 3 && (
          <>
            {/* Finish */}
            <Text variant="bodyLarge">{motivation}</Text>
          </>
        )}

        <View style={styles.gap} />
      </Card.Content>
      <View style={styles.gap} />
    </Card>
  );
};

export default NowCard;
