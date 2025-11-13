import React, {useEffect, useState} from 'react';
import {Text, ActivityIndicator, Button} from 'react-native-paper';
import {ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useSelector} from 'react-redux';
import {
  generateStats,
  generateAiSummary,
  saveSummaryToSupabase,
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
  const [stats, setStats] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const [displayedText, setDisplayedText] = useState('');
  const [currentChar, setCurrentChar] = useState(0);
  const [typewriterComplete, setTypewriterComplete] = useState(false);

  useEffect(() => {
    // Check if summary already exists for today
    const existingSummary = getDailySummary(todayKey);

    if (existingSummary) {
      // Load existing summary
      setStats({
        totalActions: existingSummary.totalActions,
        goodActions: existingSummary.goodActions,
        badActions: existingSummary.badActions,
        skipActions: existingSummary.skipActions,
        goodRate: existingSummary.goodRate,
        badRate: existingSummary.badRate,
        bestHabit: existingSummary.bestHabitName
          ? {
              habitName: existingSummary.bestHabitName,
            }
          : null,
        maxSuccessRate: existingSummary.maxSuccessRate
          ? parseFloat(existingSummary.maxSuccessRate)
          : -1,
        worstHabit: existingSummary.worstHabitName
          ? {
              habitName: existingSummary.worstHabitName,
            }
          : null,
        minSuccessRate: existingSummary.minSuccessRate
          ? parseFloat(existingSummary.minSuccessRate)
          : 101,
      });
      setAiSummary(existingSummary.aiSummary || t('summary.no_actions'));
      setTypewriterComplete(true);
      setShowButton(false);
    } else {
      // Generate new stats
      const timer = setTimeout(() => {
        const newStats = generateStats(habits, weekdayKey);
        setStats(newStats);

        if (newStats.totalActions === 0) {
          setAiSummary(t('summary.no_actions'));
          setTypewriterComplete(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [todayKey, weekdayKey]);

  useEffect(() => {
    // Generate AI summary only if not already generated
    if (
      isConnected &&
      stats &&
      stats.totalActions > 0 &&
      !aiSummary &&
      !loadingAI
    ) {
      setLoadingAI(true);
      generateAiSummary(stats)
        .then(response => {
          setAiSummary(response);
          setLoadingAI(false);
          saveSummaryToSupabase(todayKey, stats, response);
        })
        .catch(error => {
          console.error('AI request error after 3 attempts:', error);
          setAiSummary(t('summary.no_response'));
          setLoadingAI(false);
          setTypewriterComplete(true);
          saveSummaryToSupabase(todayKey, stats, null);
        });
    }
  }, [isConnected, stats, aiSummary, loadingAI, todayKey]);

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
      outline={true}
      iconContent={<StatusIconCircle end />}
      titleContent={<Text variant="titleLarge">{t('card.done')}</Text>}
      textContent={
        <ScrollView style={styles.summary_container}>
          <Text variant="bodyMedium" style={styles.summary__text}>
            {typewriterComplete ? aiSummary : displayedText}
          </Text>
        </ScrollView>
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
