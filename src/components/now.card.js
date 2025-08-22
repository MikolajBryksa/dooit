import React, {useEffect, useState} from 'react';
import {Card, Text, IconButton, Avatar, ProgressBar} from 'react-native-paper';
import {View} from 'react-native';
import {updateHabit} from '@/services/habits.service';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import SkipDialog from '@/dialogs/skip.dialog';
import {useSelector} from 'react-redux';
import PieChart from '@/components/pie.chart';
import {formatHourString} from '@/utils';

const NowCard = ({
  id,
  habitName,
  habitEnemy,
  score,
  level,
  repeatDays = [],
  repeatHours = [],
  originalRepeatHours = [],
  available,
  fetchHabits,
  onChoice,
  active,
  icon,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const clockFormat = useSelector(state => state.settings.clockFormat);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [skipDialogVisible, setSkipDialogVisible] = useState(false);
  const [displayScore, setDisplayScore] = useState(score);
  const [displayLevel, setDisplayLevel] = useState(level);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setDisplayScore(score);
    setDisplayLevel(level);
  }, [score, level, id]);

  // useEffect(() => {
  //   const done = originalRepeatHours.length - repeatHours.length;
  //   const total = originalRepeatHours.length;
  //   setProgress(total > 0 ? done / total : 0);
  //   console.log(originalRepeatHours.length, repeatHours.length);
  // }, [repeatHours, originalRepeatHours]);

  const handleSkipHabit = () => {
    if (onChoice) {
      onChoice();
    }
  };

  const handleChoice = type => {
    if (selectedChoice) return;
    setSelectedChoice(type);
    let newScore = type === 'good' ? score + 1 : Math.max(0, score - 1);
    setDisplayScore(newScore);
    let newLevel = level;
    const isLastRepetition =
      originalRepeatHours.length > 0 &&
      repeatHours[0] === originalRepeatHours[originalRepeatHours.length - 1];

    if (isLastRepetition) {
      const levelUpThreshold = Math.ceil(originalRepeatHours.length / 2);
      if (newScore >= levelUpThreshold && level < 999) {
        newLevel = Math.min(999, level + 1);
      } else if (newScore === 0 && level > 0) {
        newLevel = Math.max(0, level - 1);
      }
      setDisplayLevel(newLevel);
    }

    // const done = originalRepeatHours.length - repeatHours.length + 1;
    // const total = originalRepeatHours.length;
    // setProgress(total > 0 ? done / total : 0);

    setTimeout(() => {
      updateHabit(
        id,
        habitName,
        habitEnemy,
        isLastRepetition ? 0 : newScore,
        newLevel,
        repeatDays,
        originalRepeatHours.length > 0 ? originalRepeatHours : repeatHours,
        available,
      );
      if (!isLastRepetition) {
        fetchHabits();
      }
      setSelectedChoice(null);
      if (onChoice) onChoice();
    }, 1800);
  };

  return (
    <>
      <Card style={active ? styles.card : styles.card__deactivated}>
        <Card.Content style={styles.card__center}>
          <Avatar.Icon icon={icon} size={36} />
          <View style={styles.gap} />
          <Text variant="titleMedium">{habitName}</Text>
          <Text variant="titleSmall">
            {t('card.instead')} {habitEnemy}
          </Text>
        </Card.Content>
        <View style={styles.gap} />

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
            <Text variant="bodyMedium">
              {repeatHours
                .map(h => formatHourString(h, clockFormat))
                .join(', ')}
            </Text>
          </View>

          {/* <View
            style={{
              width: '100%',
            }}>
            <ProgressBar
              progress={progress}
              style={{height: 6, borderRadius: 4}}
            />
          </View> */}
        </Card.Content>

        <View style={styles.gap} />

        <Card.Content style={styles.card__buttons}>
          <>
            <IconButton icon="thumb-down" onPress={() => handleChoice('bad')} />
            <IconButton
              icon="close"
              onPress={() => setSkipDialogVisible(true)}
            />
            <IconButton icon="thumb-up" onPress={() => handleChoice('good')} />
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
