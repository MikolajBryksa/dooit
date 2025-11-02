import React, {useEffect, useRef, useState} from 'react';
import {Text, ActivityIndicator, Button} from 'react-native-paper';
import {Animated, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useSelector} from 'react-redux';
import {supabase} from '@/services/supabase.service';
import {getSettingValue} from '@/services/settings.service';
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
  const [typingComplete, setTypingComplete] = useState(false);
  const [aiHintsGenerated, setAiHintsGenerated] = useState(false);

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
    para1.push(t('summary.total_actions', {count: totalActions}));
    if (parseFloat(goodRate) >= parseFloat(badRate)) {
      para1.push(t('summary.good_rate_high', {rate: goodRate}));
    } else {
      para1.push(t('summary.bad_rate_high', {rate: badRate}));
    }
    paragraphs.push(para1.join(' '));

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

      const dataToSave = {
        user_id: userId,
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
    } else if (!typingComplete) {
      // Last paragraph finished typing
      const timer = setTimeout(() => {
        setTypingComplete(true);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [summaryData, currentParagraph, currentChar, typingComplete]);

  // Show hints button after typing is complete
  useEffect(() => {
    if (typingComplete && !aiHintsGenerated) {
      setShowHintsButton(true);
    } else {
      setShowHintsButton(false);
    }
  }, [typingComplete, aiHintsGenerated]);

  const handleHintsRequest = async () => {
    setLoadingHints(true);

    try {
      const language = getSettingValue('language');
      const stats = summaryData.stats;
      let prompt = '';
      if (language === 'pl') {
        prompt += `Użytkownik do tej pory wykonał ${stats.totalActions} powtórzeń wszystkich nawyków. `;
        if (stats.bestHabit) {
          prompt += `Najlepiej idzie użytkownikowi: ${stats.bestHabit.habitName} ze skutecznością na poziomie ${stats.maxSuccessRate}%. `;
        }
        if (stats.worstHabit) {
          prompt += `Najgorzej idzie użytkownikowi: ${stats.worstHabit.habitName} (${stats.minSuccessRate}%). `;
        }
        prompt += `Napisz krótką poradę lub motywację dla użytkownika, która korzystnie wpłynie na zdrowie i samopoczucie. Odpowiedź powinna mieć około 150 słów i być napisana w języku polskim. Nie używaj stylów tekstu takich jak pogrubienie (bold) czy kursywa (italic). Możesz podzielić tekst na akapity.`;
      } else {
        prompt += `The user has completed ${stats.totalActions} repetitions of all habits so far. `;
        if (stats.bestHabit) {
          prompt += `The best performing habit is: ${stats.bestHabit.habitName} with a success rate of ${stats.maxSuccessRate}%. `;
        }
        if (stats.worstHabit) {
          prompt += `The weakest habit is: ${stats.worstHabit.habitName} (${stats.minSuccessRate}%). `;
        }
        prompt += `Write a short piece of advice or motivation for the user that will positively impact their health and well-being. The answer should be about 150 words and written in English. Do not use any text styles such as bold or italic. You may split the text into paragraphs.`;
      }

      const response = await fetch(
        'https://dooit-p7ffyo32ea-lm.a.run.app/api/agent/run',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({message: prompt}),
        },
      );
      const data = await response.json();
      const aiResponse =
        data?.reply || data?.message || t('summary.no_response');

      // Add AI response to existing paragraphs
      const currentParagraphs = summaryData.paragraphs || [];
      setSummaryData({
        paragraphs: [...currentParagraphs, aiResponse],
        stats: summaryData.stats,
      });
      // Continue typewriter from where it was
      setCurrentParagraph(currentParagraphs.length);
      setCurrentChar(0);
      setTypingComplete(false);
      setLoadingHints(false);
      setShowHintsButton(false);
      setAiHintsGenerated(true);

      // Save AI response to database
      try {
        const userId = getSettingValue('userId');
        if (userId) {
          await supabase
            .from('Users')
            .update({
              ai_summary: aiResponse,
            })
            .eq('user_id', userId);
        }
      } catch (error) {
        console.error('Database save error:', error);
      }
    } catch (error) {
      setLoadingHints(false);
      setShowHintsButton(false);
      setAiHintsGenerated(true);
      console.error('AI request error:', error);
      const errorMessage = t('summary.error') || 'Error fetching hints';
      const currentParagraphs = summaryData.paragraphs || [];
      setSummaryData({
        paragraphs: [...currentParagraphs, errorMessage],
        stats: summaryData.stats,
      });
      setCurrentParagraph(currentParagraphs.length);
      setCurrentChar(0);
      setTypingComplete(false);
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
