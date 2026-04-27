import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {Text, Button} from 'react-native-paper';
import {View, Animated} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useTheme} from 'react-native-paper';
import {pickRandomMessage, getLocalDateKey} from '@/utils';
import {useCurrentTime, useChoiceEffect} from '@/hooks';
import PieCircle from '../circles/pie.circle';
import NowComponent from '../components/now.component';
import GoalReachedDialog from '@/dialogs/goal-reached.dialog';
import {
  hasExecutionOrDeleted,
  recordExecutionChoice,
  getExecutionStats,
} from '@/services/executions.service';
import {updateHabitValue} from '@/services/habits.service';

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
  onDone,
  onNext,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const theme = useTheme();
  const [step, setStep] = useState(1);
  const [isManuallyUnlocked, setIsManuallyUnlocked] = useState(false);
  const [choice, setChoice] = useState(null);
  const [motivation, setMotivation] = useState(
    pickRandomMessage(t, 'notification'),
  );
  const [liveDoneCount, setLiveDoneCount] = useState(
    () => getExecutionStats(id).doneCount || 0,
  );
  const [liveSkippedCount, setLiveSkippedCount] = useState(
    () => getExecutionStats(id).skippedCount || 0,
  );
  const [showGoalReachedDialog, setShowGoalReachedDialog] = useState(false);

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const currentTime = useCurrentTime();

  const {
    triggerEffect,
    resetEffect,
    effectType,
    cardShakeX,
    cardFlashOpacity,
    particleAnims,
  } = useChoiceEffect();

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
    setMotivation(pickRandomMessage(t, 'notification'));
    setLiveDoneCount(currentStats.doneCount || 0);
    setLiveSkippedCount(currentStats.skippedCount || 0);
    resetEffect();

    cardOpacity.setValue(0);
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [id, selectedHour, t, cardOpacity, resetEffect]);

  const today = getLocalDateKey();
  const isCompleted = hasExecutionOrDeleted(id, today, slotIndex);

  const stats = useMemo(() => {
    const target = goal || 0;
    const progress = Math.max(0, liveDoneCount || 0);
    const remaining = Math.max(0, target - progress);

    return {
      effectiveness:
        target > 0
          ? Math.min(100, Math.round((progress / target) * 100))
          : null,
      goalCount: target,
      doneCount: progress,
      skippedCount: Math.max(0, liveSkippedCount || 0),
      target,
      progress,
      label: target > 0 ? `${progress}/${target}` : null,
      remaining,
    };
  }, [goal, liveDoneCount, liveSkippedCount]);

  const choiceLabel = useMemo(() => {
    if (choice === 'done') return t('button.done');
    if (choice === 'skipped') return t('button.skipped');
    return t('button.done');
  }, [choice, t]);

  const handleChoice = useCallback(
    status => {
      if (isCompleted || step !== 1) return;

      const date = getLocalDateKey();
      recordExecutionChoice(id, date, slotIndex, selectedHour, status);

      if (status === 'done') {
        setLiveDoneCount(prev => prev + 1);
      } else if (status === 'skipped') {
        setLiveSkippedCount(prev => prev + 1);
      }

      onUpdated?.();
    },
    [id, slotIndex, selectedHour, isCompleted, step, onUpdated],
  );

  const isGoalReached =
    stats.goalCount > 0 && stats.doneCount >= stats.goalCount;
  const suggestedGoal =
    goal > 0 ? Math.max(goal + 1, Math.ceil(goal * 1.2)) : 0;

  const addGoodChoice = () => {
    triggerEffect('done');
    setChoice('done');
    setMotivation(pickRandomMessage(t, 'done'));
    handleChoice('done');
    onDone?.();
    setStep(2);

    if (goal > 0 && liveDoneCount < goal && liveDoneCount + 1 >= goal) {
      setShowGoalReachedDialog(true);
    }
  };

  const selectSkip = () => {
    addBadChoice();
  };

  const addBadChoice = () => {
    triggerEffect('skipped');
    setChoice('skipped');
    setMotivation(pickRandomMessage(t, 'skipped'));
    handleChoice('skipped');
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
    if (step !== 2) return theme.colors.onSurface;
    if (choice === 'done') return theme.colors.success;
    if (choice === 'skipped') return theme.colors.error;
    return theme.colors.onSurface;
  };

  const particleIsDone = effectType === 'done';

  return (
    <>
      <View style={styles.cardWrapper}>
        <Animated.View style={{transform: [{translateX: cardShakeX}]}}>
          <NowComponent
            animatedStyle={{opacity: cardOpacity}}
            iconContent={
              <View style={styles.iconWrapper}>
                <PieCircle
                  icon={icon}
                  goalCount={stats.goalCount}
                  doneCount={stats.doneCount}
                  opacity={isLocked ? 0.5 : 1}
                  showCounter={true}
                  isGoalReached={isGoalReached}
                />
                {particleAnims.map((anim, i) => (
                  <Animated.View
                    key={`p-${i}`}
                    pointerEvents="none"
                    style={[
                      styles.particle,
                      {
                        width: particleIsDone ? 8 : 11,
                        height: particleIsDone ? 8 : 6,
                        borderRadius: particleIsDone ? 4 : 2,
                        backgroundColor: particleIsDone
                          ? theme.colors.success
                          : theme.colors.background,
                        transform: [
                          {translateX: anim.translateX},
                          {translateY: anim.translateY},
                          {scale: anim.scale},
                        ],
                        opacity: anim.opacity,
                      },
                    ]}
                  />
                ))}
              </View>
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
                      <Button mode="outlined" icon="close" onPress={selectSkip}>
                        {t('button.skip')}
                      </Button>
                      <Button
                        mode="contained"
                        icon="check"
                        onPress={addGoodChoice}>
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
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: theme.dimensions.gap,
            borderRadius: 12,
            backgroundColor:
              effectType === 'skipped'
                ? theme.colors.error
                : theme.colors.success,
            opacity: cardFlashOpacity,
          }}
        />
      </View>

      <GoalReachedDialog
        visible={showGoalReachedDialog}
        onDismiss={() => setShowGoalReachedDialog(false)}
        currentGoal={goal}
        suggestedGoal={suggestedGoal}
        onIncreaseGoal={() => {
          updateHabitValue(id, 'goal', suggestedGoal);
          onUpdated?.();
          setShowGoalReachedDialog(false);
        }}
      />
    </>
  );
};

export default NowCard;
