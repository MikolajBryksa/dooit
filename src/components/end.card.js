import React, {useEffect, useRef, useState} from 'react';
import {Text, ActivityIndicator, Button} from 'react-native-paper';
import {Animated, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useSelector} from 'react-redux';
import {supabase} from '@/services/supabase.service';
import {getSettingValue} from '@/services/settings.service';
import {generateAIHints} from '@/services/ai.service';
import {useNetworkStatus} from '@/hooks';
import MainCard from './main.card';
import StatusIconCircle from './status-icon.circle';

const EndCard = ({weekdayKey}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const habits = useSelector(state => state.habits);
  const {isConnected} = useNetworkStatus(true);
  const [summaryData, setSummaryData] = useState({paragraphs: []});
  const [displayedText, setDisplayedText] = useState([]);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [showHintsButton, setShowHintsButton] = useState(false);
  const [loadingHints, setLoadingHints] = useState(false);
  const [aiHintsGenerated, setAiHintsGenerated] = useState(false);
  const [aiGenerationStarted, setAiGenerationStarted] = useState(false);
  const [aiError, setAiError] = useState(false);

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
      ]),
    ]).start();
  }, [habits]);

  useEffect(() => {
    if (showHintsButton) {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [showHintsButton]);

  useEffect(() => {
    // Generate and save a summary based on habits performance
    const timer = setTimeout(() => {
      const summary = generateSummary(habits);
      setSummaryData(summary);
      summary && saveSummaryToSupabase(summary.stats);

      // Start AI generation automatically in background
      if (isConnected && !aiGenerationStarted) {
        setAiGenerationStarted(true);
        setLoadingHints(true);
        generateAIHintsInBackground(summary.stats);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [habits]);

  function generateSummary(habits) {
    let totalActions = 0;
    let goodActions = 0;
    let badActions = 0;
    let skipActions = 0;
    let bestHabit = null;
    let worstHabit = null;
    let maxSuccessRate = -1;
    let minSuccessRate = 101;

    const todayHabits = habits.filter(
      habit => habit.available && habit.repeatDays.includes(weekdayKey),
    );

    todayHabits.forEach(habit => {
      const total = habit.goodCounter + habit.badCounter;
      const successRate = ((habit.goodCounter / total) * 100).toFixed(0);

      totalActions += total;
      goodActions += habit.goodCounter;
      badActions += habit.badCounter;
      skipActions += habit.skipCounter;

      if (successRate > maxSuccessRate && habit.goodCounter > 0) {
        maxSuccessRate = successRate;
        bestHabit = habit;
      }

      if (successRate < minSuccessRate && habit.badCounter > 0) {
        minSuccessRate = successRate;
        worstHabit = habit;
      }
    });

    const goodRate = ((goodActions / totalActions) * 100).toFixed(0);
    const badRate = ((badActions / totalActions) * 100).toFixed(0);

    // Paragraphs construction
    const paragraphs = [];

    const para1 = [];
    if (totalActions === 0) {
      para1.push(t('summary.no_actions'));
    } else {
      para1.push(t('summary.total_actions', {count: totalActions}));
      if (parseFloat(goodRate) >= parseFloat(badRate)) {
        para1.push(t('summary.good_rate_high', {rate: goodRate}));
      } else {
        para1.push(t('summary.bad_rate_high', {rate: badRate}));
      }
      paragraphs.push(para1.join(' '));
    }

    if (bestHabit && maxSuccessRate >= 50) {
      const para2 = [];
      para2.push(t('summary.best_habit', {habit: bestHabit.habitName}));
      para2.push(t('summary.best_habit_rate', {rate: maxSuccessRate}));
      paragraphs.push(para2.join('\n'));
    }

    if (worstHabit && minSuccessRate < 70 && worstHabit !== bestHabit) {
      const para3 = [];
      para3.push(t('summary.worst_habit', {habit: worstHabit.habitName}));
      para3.push(t('summary.worst_habit_rate', {rate: minSuccessRate}));
      paragraphs.push(para3.join('\n'));
    }

    return {
      paragraphs,
      stats: {
        totalActions,
        goodActions,
        badActions,
        skipActions,
        goodRate,
        badRate,
        bestHabit,
        maxSuccessRate,
        worstHabit,
        minSuccessRate,
      },
    };
  }

  const saveSummaryToSupabase = async stats => {
    if (!isConnected) {
      return;
    }

    try {
      const userId = getSettingValue('userId');
      const userName = getSettingValue('userName');

      const dataToSave = {
        user_id: userId,
        user_name: userName,
        updated_at: new Date().toISOString(),
        total_actions: stats.totalActions,
        good_actions: stats.goodActions,
        bad_actions: stats.badActions,
        skip_actions: stats.skipActions,
        good_rate: stats.goodRate,
        bad_rate: stats.badRate,
        best_habit_name: stats.bestHabit?.habitName || null,
        best_habit_rate:
          stats.maxSuccessRate >= 0 ? stats.maxSuccessRate : null,
        worst_habit_name: stats.worstHabit?.habitName || null,
        worst_habit_rate:
          stats.minSuccessRate <= 100 ? stats.minSuccessRate : null,
      };

      const {error} = await supabase.from('Users').upsert(dataToSave, {
        onConflict: 'user_id',
      });

      if (error) {
        console.error(error);
        return;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const generateAIHintsInBackground = async stats => {
    try {
      const aiResponse = await generateAIHints(stats);

      // Add AI response as the 4th paragraph
      setSummaryData(prevData => ({
        paragraphs: [...prevData.paragraphs, aiResponse],
        stats: prevData.stats,
      }));

      setLoadingHints(false);
      setAiHintsGenerated(true);
    } catch (error) {
      console.error('AI request error:', error);
      setLoadingHints(false);
      setAiError(true);
      // Show button to retry if AI failed
      setShowHintsButton(true);
    }
  };

  // Typewriter effect
  useEffect(() => {
    if (!summaryData.paragraphs || summaryData.paragraphs.length === 0) {
      return;
    }

    if (currentParagraph >= summaryData.paragraphs.length) {
      return;
    }

    const currentText = summaryData.paragraphs[currentParagraph];

    if (currentChar < currentText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => {
          const newText = [...prev];
          if (!newText[currentParagraph]) {
            newText[currentParagraph] = '';
          }
          newText[currentParagraph] = currentText.substring(0, currentChar + 1);
          return newText;
        });
        setCurrentChar(currentChar + 1);
      }, 20); // Speed of typing

      return () => clearTimeout(timer);
    } else if (currentParagraph < summaryData.paragraphs.length - 1) {
      const timer = setTimeout(() => {
        setCurrentParagraph(currentParagraph + 1);
        setCurrentChar(0);
      }, 300); // Pause between paragraphs

      return () => clearTimeout(timer);
    }
  }, [summaryData, currentParagraph, currentChar]);

  // Show hints button logic
  useEffect(() => {
    // Show button only if:
    // 1. No internet when component mounted (AI never started)
    // 2. AI generation failed with error
    if (!isConnected && !aiGenerationStarted) {
      setShowHintsButton(true);
    } else if (aiError && !aiHintsGenerated) {
      setShowHintsButton(true);
    } else if (loadingHints && currentParagraph >= 2) {
      // Show "generating" button if AI is still loading after 3rd paragraph
      setShowHintsButton(true);
    } else if (aiHintsGenerated) {
      setShowHintsButton(false);
    }
  }, [
    isConnected,
    aiGenerationStarted,
    aiError,
    aiHintsGenerated,
    loadingHints,
    currentParagraph,
  ]);

  const handleHintsRequest = async () => {
    if (!isConnected) {
      return;
    }

    setLoadingHints(true);
    setAiError(false);
    setShowHintsButton(false);

    if (!aiGenerationStarted) {
      setAiGenerationStarted(true);
    }

    try {
      const aiResponse = await generateAIHints(summaryData.stats);

      // Add AI response to existing paragraphs
      setSummaryData(prevData => ({
        paragraphs: [...prevData.paragraphs, aiResponse],
        stats: prevData.stats,
      }));

      setLoadingHints(false);
      setAiHintsGenerated(true);
    } catch (error) {
      console.error('AI request error:', error);
      setLoadingHints(false);
      setAiError(true);
      setShowHintsButton(true);

      const errorMessage = t('summary.error') || 'Error fetching hints';
      setSummaryData(prevData => ({
        paragraphs: [...prevData.paragraphs, errorMessage],
        stats: prevData.stats,
      }));
    }
  };

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
          {displayedText.map((paragraph, index) => (
            <Text key={index} variant="bodyMedium" style={styles.summary__text}>
              {paragraph}
            </Text>
          ))}
        </ScrollView>
      }
      buttonsContent={
        showHintsButton ? (
          <Animated.View
            style={{
              opacity: buttonOpacity,
              transform: [{scale}],
            }}>
            <Button
              style={styles.button}
              mode="contained"
              onPress={handleHintsRequest}
              disabled={!isConnected || loadingHints}
              icon={
                !isConnected
                  ? 'wifi-off'
                  : loadingHints
                  ? () => <ActivityIndicator size={16} />
                  : 'auto-fix'
              }>
              {!isConnected
                ? t('button.offline')
                : loadingHints
                ? t('button.generating')
                : t('button.hints')}
            </Button>
          </Animated.View>
        ) : null
      }
    />
  );
};

export default EndCard;
