import React, {useEffect, useState, useMemo} from 'react';
import {Text, ActivityIndicator, Button} from 'react-native-paper';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useSelector} from 'react-redux';
import {
  generateAiSummary,
  saveSummary,
  getDailySummary,
} from '@/services/summary.service';
import {useNetworkStatus, useTodayKey} from '@/hooks';
import MainCard from './main.card';
import StatusIconCircle from './status-icon.circle';

const EndCard = ({weekdayKey}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const habits = useSelector(state => state.habits);
  const todayKey = useTodayKey();
  const {isConnected} = useNetworkStatus(true);

  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [currentChar, setCurrentChar] = useState(0);
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const [hasExistingSummary, setHasExistingSummary] = useState(false);

  const simplifiedHabits = useMemo(
    () =>
      habits
        .filter(
          habit => habit.available && habit.repeatDays.includes(weekdayKey),
        )
        .map(habit => ({
          habitName: habit.habitName,
          habitEnemy: habit.habitEnemy,
          goodCounter: habit.goodCounter,
          badCounter: habit.badCounter,
          skipCounter: habit.skipCounter,
          repeatDays: habit.repeatDays,
          repeatHours: habit.repeatHours,
        })),
    [habits, weekdayKey],
  );

  useEffect(() => {
    try {
      const existingSummary = getDailySummary(todayKey);

      if (existingSummary && existingSummary.aiSummary) {
        setAiSummary(existingSummary.aiSummary);
        setDisplayedText(existingSummary.aiSummary);
        setCurrentChar(existingSummary.aiSummary.length);
        setTypewriterComplete(true);
        setHasExistingSummary(true);
      } else if (simplifiedHabits.length === 0) {
        const msg = t('summary.no_actions');
        setAiSummary(msg);
        setDisplayedText(msg);
        setCurrentChar(msg.length);
        setTypewriterComplete(true);
      }
    } catch (e) {
      const msg = t('summary.no_response');
      setAiSummary(msg);
      setDisplayedText(msg);
      setCurrentChar(msg.length);
      setTypewriterComplete(true);
    }
  }, [todayKey, simplifiedHabits.length, t]);

  const handleGenerate = async () => {
    if (loadingAI || !simplifiedHabits.length || !isConnected) {
      return;
    }

    setLoadingAI(true);
    setTypewriterComplete(false);
    setDisplayedText('');
    setCurrentChar(0);

    try {
      const response = await generateAiSummary(simplifiedHabits);
      setAiSummary(response);

      try {
        await saveSummary(todayKey, simplifiedHabits, response);
        setHasExistingSummary(true);
      } catch (saveError) {}
    } catch (error) {
      const msg = t('summary.no_response');
      setAiSummary(msg);
      setDisplayedText(msg);
      setCurrentChar(msg.length);
      setTypewriterComplete(true);

      try {
        await saveSummary(todayKey, simplifiedHabits, null);
      } catch (saveError) {}
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    if (!aiSummary || typewriterComplete || loadingAI) return;

    if (currentChar < aiSummary.length) {
      const timer = setTimeout(() => {
        setDisplayedText(aiSummary.substring(0, currentChar + 1));
        setCurrentChar(currentChar + 1);
      }, 20);
      return () => clearTimeout(timer);
    } else {
      setTypewriterComplete(true);
    }
  }, [aiSummary, currentChar, typewriterComplete, loadingAI]);

  const textToShow = aiSummary ? displayedText || aiSummary : '';

  const hasHabitsToday = simplifiedHabits.length > 0;

  const renderButton = () => {
    if (!hasHabitsToday) {
      return null;
    }

    if (!isConnected) {
      return (
        <Button
          style={styles.button}
          mode="contained"
          onPress={() => {}}
          disabled={true}
          icon="wifi-off">
          {t('button.offline')}
        </Button>
      );
    }

    if (loadingAI) {
      return (
        <Button
          style={styles.button}
          mode="contained"
          onPress={() => {}}
          disabled={true}
          icon={() => <ActivityIndicator size={16} />}>
          {t('button.generating')}
        </Button>
      );
    }

    return (
      <Button
        style={styles.button}
        mode="contained"
        icon="creation"
        onPress={handleGenerate}>
        {hasExistingSummary
          ? t('button.try-again')
          : t('button.generate-summary')}
      </Button>
    );
  };

  return (
    <MainCard
      style={styles.summary__card}
      outline={true}
      iconContent={<StatusIconCircle end />}
      titleContent={<Text variant="titleLarge">{t('card.done')}</Text>}
      textContent={
        <View style={styles.summary_container}>
          <Text variant="bodyMedium" style={styles.summary__text}>
            {textToShow}
          </Text>
        </View>
      }
      buttonsContent={renderButton()}
    />
  );
};

export default EndCard;
