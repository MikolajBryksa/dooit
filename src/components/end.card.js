import React, {useEffect, useState, useMemo} from 'react';
import {Text, ActivityIndicator, Button} from 'react-native-paper';
import {View, ScrollView} from 'react-native';
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
import {logError} from '@/services/error-tracking.service';
import {pickRandomMotivation} from '@/utils';

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
  const [hadError, setHadError] = useState(false);

  const [motivation, setMotivation] = useState(pickRandomMotivation(t, 'end'));

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
    // Check if we have an existing summary for today
    setMotivation(pickRandomMotivation(t, 'end'));
    try {
      const existingSummary = getDailySummary(todayKey);

      if (existingSummary && existingSummary.aiSummary) {
        // We have a valid summary saved in the database
        setAiSummary(existingSummary.aiSummary);
        setDisplayedText(existingSummary.aiSummary);
        setCurrentChar(existingSummary.aiSummary.length);
        setTypewriterComplete(true);
        setHasExistingSummary(true);
        setHadError(false);
      } else if (simplifiedHabits.length === 0) {
        // No habits today
        const msg = t('summary.no_actions');
        setAiSummary(msg);
        setDisplayedText(msg);
        setCurrentChar(msg.length);
        setTypewriterComplete(true);
        setHasExistingSummary(false);
        setHadError(false);
      } else {
        // We can generate a new summary
        setHasExistingSummary(false);
        setHadError(false);
      }
    } catch (e) {
      // Error reading local database
      const msg = t('summary.error_reading');
      setAiSummary(msg);
      setDisplayedText(msg);
      setCurrentChar(msg.length);
      setTypewriterComplete(true);
      setHasExistingSummary(false);
      setHadError(true);
    }
  }, [todayKey, simplifiedHabits.length, t]);

  const handleGenerate = async () => {
    if (loadingAI || !simplifiedHabits.length || !isConnected) {
      return;
    }

    try {
      setLoadingAI(true);
      setTypewriterComplete(false);
      setDisplayedText('');
      setCurrentChar(0);
      setHadError(false);

      try {
        const response = await generateAiSummary(simplifiedHabits);
        setAiSummary(response);

        try {
          await saveSummary(todayKey, simplifiedHabits, response);
          setHasExistingSummary(true);
          setHadError(false);
        } catch (saveError) {
          await logError(saveError, 'EndCard.saveSummary');
          setHasExistingSummary(false);
          setHadError(true);
        }
      } catch (error) {
        await logError(error, 'EndCard.generateAiSummary');

        const msg = t('summary.no_response');
        setAiSummary(msg);
        setDisplayedText(msg);
        setCurrentChar(msg.length);
        setTypewriterComplete(true);
        setHasExistingSummary(false);
        setHadError(true);

        try {
          await saveSummary(todayKey, simplifiedHabits, null);
        } catch (saveError) {
          await logError(saveError, 'EndCard.saveSummary.null');
        }
      } finally {
        setLoadingAI(false);
      }
    } catch (fatalError) {
      console.error('[EndCard.handleGenerate] Fatal error:', fatalError);
      await logError(fatalError, 'EndCard.handleGenerate.fatal');

      setLoadingAI(false);

      const msg = t('summary.no_response');
      setAiSummary(msg);
      setDisplayedText(msg);
      setCurrentChar(msg.length);
      setTypewriterComplete(true);
      setHasExistingSummary(false);
      setHadError(true);
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

  const textToShow = typewriterComplete ? aiSummary : displayedText;

  const hasHabitsToday = simplifiedHabits.length > 0;

  const renderButton = () => {
    if (!hasHabitsToday || hasExistingSummary) {
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
        <>
          <View style={styles.card__choicesTitleContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text variant="titleMedium" style={{minWidth: '100%'}}>
                {motivation}
              </Text>
            </ScrollView>
          </View>
          <View style={styles.summary_container}>
            <Text variant="bodyMedium" style={styles.summary__text}>
              {textToShow}
            </Text>
          </View>
        </>
      }
      buttonsContent={renderButton()}
    />
  );
};

export default EndCard;
