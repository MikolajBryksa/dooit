import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {Text, Button} from 'react-native-paper';
import {View, Animated} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useTheme} from 'react-native-paper';
import {pickRandomMotivation, getLocalDateKey, hexToRgba} from '@/utils';
import {useCurrentTime} from '@/hooks';
import PieCircle from '../circles/pie.circle';
import NowComponent from '../components/now.component';
import {
  hasExecutionOrDeleted,
  recordExecutionChoice,
  getExecutionStats,
} from '@/services/executions.service';

const NowCard = ({
  id,
  habitName,
  selectedHour,
  slotIndex,
  icon,
  goal,
  isNext = false,
  isLastHabit = false,
  onUpdated,
  onNext,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const theme = useTheme();

  const [step, setStep] = useState(1);
  const [isManuallyUnlocked, setIsManuallyUnlocked] = useState(false);
  const [choice, setChoice] = useState(null);
  const [motivation, setMotivation] = useState(
    pickRandomMotivation(t, 'notification'),
  );
  const [liveGoodCount, setLiveGoodCount] = useState(0);
  const [liveBadCount, setLiveBadCount] = useState(0);

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const currentTime = useCurrentTime();

  const isSelectedHourLater = useMemo(() => {
    if (!selectedHour || !currentTime) return false;

    const [h, m] = selectedHour.split(':').map(Number);
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const selectedMinutes = h * 60 + (m || 0);

    return selectedMinutes > nowMinutes;
  }, [selectedHour, currentTime]);

  const isLocked = isSelectedHourLater && !isManuallyUnlocked;

  useEffect(() => {
    const currentStats = getExecutionStats(id);

    setStep(1);
    setIsManuallyUnlocked(false);
    setChoice(null);
    setMotivation(pickRandomMotivation(t, 'notification'));
    setLiveGoodCount(currentStats.goodCount || 0);
    setLiveBadCount(currentStats.badCount || 0);

    cardOpacity.setValue(0);
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [id, selectedHour, t, cardOpacity]);

  const today = getLocalDateKey();
  const isCompleted = hasExecutionOrDeleted(id, today, slotIndex);

  const stats = useMemo(() => {
    const target = goal || 0;
    const progress = Math.max(0, liveGoodCount || 0);
    const remaining = Math.max(0, target - progress);

    return {
      effectiveness:
        target > 0
          ? Math.min(100, Math.round((progress / target) * 100))
          : null,
      goalCount: target,
      goodCount: progress,
      badCount: Math.max(0, liveBadCount || 0),
      target,
      progress,
      label: target > 0 ? `${progress}/${target}` : null,
      remaining,
    };
  }, [goal, liveGoodCount, liveBadCount]);

  const choiceLabel = useMemo(() => {
    if (choice === 'good') return t('button.done');
    if (choice === 'bad') return t('button.skipped');
    return t('button.done');
  }, [choice, t]);

  const handleChoice = useCallback(
    status => {
      if (isCompleted || step !== 1) return;

      const date = getLocalDateKey();
      recordExecutionChoice(id, date, slotIndex, selectedHour, status);

      if (status === 'good') {
        setLiveGoodCount(prev => prev + 1);
      } else if (status === 'bad') {
        setLiveBadCount(prev => prev + 1);
      }

      onUpdated?.();
    },
    [id, slotIndex, selectedHour, isCompleted, step, onUpdated],
  );

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

  if (!isNext) {
    return null;
  }

  const getChoiceTextColor = () => {
    if (step !== 2) return theme.colors.text;
    if (choice === 'good') return theme.colors.success;
    if (choice === 'bad') return theme.colors.error;
    return theme.colors.text;
  };

  return (
    <NowComponent
      animatedStyle={{opacity: cardOpacity}}
      iconContent={
        <PieCircle
          icon={icon}
          goalCount={stats.goalCount}
          goodCount={stats.goodCount}
          opacity={isLocked ? 0.5 : 1}
          showCounter={true}
        />
      }
      subtitleContent={
        <Text variant="titleMedium" opacity={isLocked ? 0.5 : 1}>
          {step === 1 ? selectedHour : motivation}
        </Text>
      }
      titleContent={
        <Text
          variant="titleLarge"
          numberOfLines={2}
          opacity={isLocked ? 0.5 : 1}
          style={{color: getChoiceTextColor()}}>
          {step === 1 ? habitName : choiceLabel}
        </Text>
      }
      buttonsContent={
        <View style={styles.buttons}>
          {step === 1 ? (
            isLocked ? (
              <Button
                mode="contained"
                icon="lock-open-variant"
                onPress={handleUnlock}>
                {t('button.unlock')}
              </Button>
            ) : (
              <>
                <Button mode="outlined" icon="close" onPress={addBadChoice}>
                  {t('button.skip')}
                </Button>
                <Button mode="contained" icon="check" onPress={addGoodChoice}>
                  {t('button.done')}
                </Button>
              </>
            )
          ) : (
            <Button
              mode="contained"
              icon={isLastHabit ? 'check' : 'arrow-right'}
              onPress={handleNext}>
              {isLastHabit ? t('button.finish') : t('button.next')}
            </Button>
          )}
        </View>
      }
    />
  );
};

export default NowCard;
