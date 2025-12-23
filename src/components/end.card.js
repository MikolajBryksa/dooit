import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {ActivityIndicator, Button, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {useStyles} from '@/styles';
import {useNetworkStatus, useTodayKey} from '@/hooks';
import {
  generateAiSummary,
  getDailySummary,
  saveSummary,
} from '@/services/summary.service';
import {logError} from '@/services/error-tracking.service';
import {calculateWeeklyEffectiveness} from '@/services/effectiveness.service';

import MainCard from './main.card';
import StatusIconCircle from './status-icon.circle';

// Build a minimal habit payload with weekly effectiveness computed once
const withWeeklyEffectiveness = habits =>
  habits.map(h => {
    const stats = calculateWeeklyEffectiveness(h.id, {
      id: h.id,
      repeatDays: h.repeatDays,
      repeatHours: h.repeatHours,
    });

    return {
      id: h.id,
      habitName: h.habitName,
      habitEnemy: h.habitEnemy,
      repeatDays: h.repeatDays,
      repeatHours: h.repeatHours,
      effectiveness: stats.effectiveness,
      totalExpected: stats.totalExpected,
    };
  });

const EndCard = ({weekdayKey}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const habits = useSelector(state => state.habits);
  const todayKey = useTodayKey();
  const {isConnected} = useNetworkStatus(true);

  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Typewriter state
  const [displayedText, setDisplayedText] = useState('');
  const [currentChar, setCurrentChar] = useState(0);
  const [typewriterComplete, setTypewriterComplete] = useState(false);

  // UI flags
  const [hasExistingSummary, setHasExistingSummary] = useState(false);
  const [hadError, setHadError] = useState(false);

  const availableHabits = useMemo(
    () => habits.filter(h => h.available),
    [habits],
  );

  const todayHabits = useMemo(
    () => habits.filter(h => h.available && h.repeatDays.includes(weekdayKey)),
    [habits, weekdayKey],
  );

  // Compute effectiveness once and reuse for both AI prompt and persistence
  const allAvailableHabitsWithEff = useMemo(
    () => withWeeklyEffectiveness(availableHabits),
    [availableHabits],
  );

  const todayHabitsWithEff = useMemo(
    () => withWeeklyEffectiveness(todayHabits),
    [todayHabits],
  );

  useEffect(() => {
    // Check if we have an existing summary for today
    try {
      const existingSummary = getDailySummary(todayKey);

      if (existingSummary?.aiSummary) {
        // We have a valid summary saved in the database
        const text = existingSummary.aiSummary;
        setAiSummary(text);
        setDisplayedText(text);
        setCurrentChar(text.length);
        setTypewriterComplete(true);
        setHasExistingSummary(true);
        setHadError(false);
        return;
      }

      if (todayHabits.length === 0) {
        // No habits today
        const msg = t('summary.no-actions');
        setAiSummary(msg);
        setDisplayedText(msg);
        setCurrentChar(msg.length);
        setTypewriterComplete(true);
        setHasExistingSummary(false);
        setHadError(false);
        return;
      }

      // We can generate a new summary
      setAiSummary('');
      setDisplayedText('');
      setCurrentChar(0);
      setTypewriterComplete(true);
      setHasExistingSummary(false);
      setHadError(false);
    } catch (e) {
      // Error reading local database
      const msg = t('summary.error-reading');
      setAiSummary(msg);
      setDisplayedText(msg);
      setCurrentChar(msg.length);
      setTypewriterComplete(true);
      setHasExistingSummary(false);
      setHadError(true);
    }
  }, [todayKey, todayHabits.length, t]);

  const handleGenerate = async () => {
    if (loadingAI || todayHabitsWithEff.length === 0 || !isConnected) return;

    setLoadingAI(true);
    setHadError(false);

    // Reset typewriter
    setTypewriterComplete(false);
    setDisplayedText('');
    setCurrentChar(0);

    try {
      // Generate summary from habits WITH effectiveness (computed once in UI)
      const response = await generateAiSummary(todayHabitsWithEff);
      setAiSummary(response);

      try {
        // Persist full available habits WITH effectiveness + AI summary
        await saveSummary(todayKey, allAvailableHabitsWithEff, response);
        setHasExistingSummary(true);
        setHadError(false);
      } catch (saveError) {
        await logError(saveError, 'EndCard.saveSummary');
        setHasExistingSummary(false);
        setHadError(true);
      }
    } catch (error) {
      await logError(error, 'EndCard.generateAiSummary');

      const msg = t('summary.no-response');
      setAiSummary(msg);
      setDisplayedText(msg);
      setCurrentChar(msg.length);
      setTypewriterComplete(true);

      setHasExistingSummary(false);
      setHadError(true);

      // Save a "null summary" to avoid repeated failing calls and keep a trace
      try {
        await saveSummary(todayKey, allAvailableHabitsWithEff, null);
      } catch (saveError) {
        await logError(saveError, 'EndCard.saveSummary.null');
      }
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    // Typewriter effect
    if (!aiSummary || typewriterComplete || loadingAI) return;

    if (currentChar < aiSummary.length) {
      const timer = setTimeout(() => {
        setDisplayedText(aiSummary.substring(0, currentChar + 1));
        setCurrentChar(c => c + 1);
      }, 20);

      return () => clearTimeout(timer);
    }

    setTypewriterComplete(true);
  }, [aiSummary, currentChar, typewriterComplete, loadingAI]);

  const textToShow = typewriterComplete ? aiSummary : displayedText;

  const renderButton = () => {
    const hasHabitsToday = todayHabitsWithEff.length > 0;

    if (!hasHabitsToday || hasExistingSummary) return null;

    if (!isConnected) {
      return (
        <Button
          style={styles.button}
          mode="contained"
          onPress={() => {}}
          disabled
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
          disabled
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
        {hadError ? t('button.try-again') : t('button.generate-summary')}
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
