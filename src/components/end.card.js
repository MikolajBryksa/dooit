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
import {useNetworkStatus} from '@/hooks';
import {useTodayKey} from '@/hooks';
import MainCard from './main.card';
import StatusIconCircle from './status-icon.circle';

const EndCard = ({weekdayKey}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const habits = useSelector(state => state.habits);
  const todayKey = useTodayKey();
  const {isConnected} = useNetworkStatus(true);
  const [showButton, setShowButton] = useState(true);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [currentChar, setCurrentChar] = useState(0);
  const [typewriterComplete, setTypewriterComplete] = useState(false);

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
    const existingSummary = getDailySummary(todayKey);

    if (existingSummary) {
      setAiSummary(existingSummary.aiSummary);
      setTypewriterComplete(true);
      setShowButton(false);
    } else {
      if (simplifiedHabits.length === 0) {
        setAiSummary(t('summary.no_actions'));
        setTypewriterComplete(true);
      }
    }
  }, [todayKey]);

  useEffect(() => {
    // Generate AI summary only if not already generated
    if (
      isConnected &&
      simplifiedHabits &&
      simplifiedHabits.length > 0 &&
      !aiSummary &&
      !loadingAI
    ) {
      setLoadingAI(true);
      generateAiSummary(simplifiedHabits)
        .then(response => {
          setAiSummary(response);
          setLoadingAI(false);
          saveSummary(todayKey, simplifiedHabits, response);
        })
        .catch(error => {
          setAiSummary(t('summary.no_response'));
          setLoadingAI(false);
          setTypewriterComplete(true);
          saveSummary(todayKey, simplifiedHabits, null);
        });
    }
  }, [isConnected, habits, aiSummary, loadingAI, todayKey]);

  useEffect(() => {
    // Typewriter effect - only if not already complete
    if (!aiSummary || typewriterComplete) return;

    if (showButton) {
      setShowButton(false);
    }

    if (currentChar < aiSummary.length) {
      const timer = setTimeout(() => {
        setDisplayedText(aiSummary.substring(0, currentChar + 1));
        setCurrentChar(currentChar + 1);
      }, 20);
      return () => clearTimeout(timer);
    } else {
      setTypewriterComplete(true);
    }
  }, [aiSummary, currentChar, showButton, typewriterComplete]);

  return (
    <MainCard
      style={styles.summary__card}
      outline={true}
      iconContent={<StatusIconCircle end />}
      titleContent={<Text variant="titleLarge">{t('card.done')}</Text>}
      textContent={
        <View style={styles.summary_container}>
          <Text variant="bodyMedium" style={styles.summary__text}>
            {typewriterComplete ? aiSummary : displayedText}
          </Text>
        </View>
      }
      buttonsContent={
        showButton ? (
          <Button
            style={styles.button}
            mode="contained"
            onPress={() => {}}
            disabled={true}
            icon={
              !isConnected ? 'wifi-off' : () => <ActivityIndicator size={16} />
            }>
            {!isConnected ? t('button.offline') : t('button.generating')}
          </Button>
        ) : null
      }
    />
  );
};

export default EndCard;
