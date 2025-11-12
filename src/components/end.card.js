import React, {useEffect, useRef, useState} from 'react';
import {Text, ActivityIndicator, Button} from 'react-native-paper';
import {Animated, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useSelector} from 'react-redux';
import {
  generateStats,
  generateAiSummary,
  saveSummaryToSupabase,
} from '@/services/summary.service';
import {useNetworkStatus} from '@/hooks';
import MainCard from './main.card';
import StatusIconCircle from './status-icon.circle';

const EndCard = ({weekdayKey}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const habits = useSelector(state => state.habits);

  const {isConnected} = useNetworkStatus(true);
  const [showButton, setShowButton] = useState(true);
  const [stats, setStats] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const [displayedText, setDisplayedText] = useState('');
  const [currentChar, setCurrentChar] = useState(0);

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [habits]);

  useEffect(() => {
    // Generate stats
    const timer = setTimeout(() => {
      const stats = generateStats(habits, weekdayKey);
      setStats(stats);

      if (stats.totalActions === 0) {
        setAiSummary(t('summary.no_actions'));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [habits]);

  useEffect(() => {
    // Generate AI summary
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
          saveSummaryToSupabase(stats, response);
        })
        .catch(error => {
          console.error('AI request error:', error);
          setLoadingAI(false);
          saveSummaryToSupabase(stats, null);
        });
    }
  }, [isConnected, stats, aiSummary, loadingAI]);

  useEffect(() => {
    // Typewriter effect
    if (!aiSummary) return;
    if (showButton) {
      setShowButton(false);
    }
    if (currentChar < aiSummary.length) {
      const timer = setTimeout(() => {
        setDisplayedText(aiSummary.substring(0, currentChar + 1));
        setCurrentChar(currentChar + 1);
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [aiSummary, currentChar]);

  return (
    <MainCard
      outline={true}
      iconContent={
        <Animated.View style={{opacity, transform: [{scale}]}}>
          <StatusIconCircle end />
        </Animated.View>
      }
      titleContent={
        <Animated.View style={{opacity, transform: [{scale}]}}>
          <Text variant="titleLarge">{t('card.done')}</Text>
        </Animated.View>
      }
      textContent={
        <ScrollView style={styles.summary_container}>
          <Text variant="bodyMedium" style={styles.summary__text}>
            {displayedText}
          </Text>
        </ScrollView>
      }
      buttonsContent={
        showButton ? (
          <Animated.View
            style={{
              opacity: buttonOpacity,
              transform: [{scale}],
            }}>
            <Button
              style={styles.button}
              mode="contained"
              onPress={() => {}}
              disabled={true}
              icon={
                !isConnected
                  ? 'wifi-off'
                  : () => <ActivityIndicator size={16} />
              }>
              {!isConnected ? t('button.offline') : t('button.generating')}
            </Button>
          </Animated.View>
        ) : null
      }
    />
  );
};

export default EndCard;
