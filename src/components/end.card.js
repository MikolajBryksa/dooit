import React, {useEffect, useRef, useState} from 'react';
import {Card, Text, ActivityIndicator, Button} from 'react-native-paper';
import {View, Animated} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useSelector} from 'react-redux';
import {supabase} from '@/services/supabase.service';
import {getSettingValue} from '@/services/settings.service';
import {use} from 'i18next';

const EndCard = ({weekdayKey}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const habits = useSelector(state => state.habits);
  const [summaryData, setSummaryData] = useState({paragraphs: []});

  const [displayedText, setDisplayedText] = useState([]);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [showHintsButton, setShowHintsButton] = useState(false);
  const [hintsRequested, setHintsRequested] = useState(false);
  const [loadingHints, setLoadingHints] = useState(false);
  const [hintsText, setHintsText] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const containerHeight = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: false,
        }),
        Animated.timing(containerHeight, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
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
      const total = habit.goodCounter + habit.badCounter + habit.skipCounter;
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

    if (worstHabit && minSuccessRate < 80) {
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

      const {data, error} = await supabase.from('Users').upsert(dataToSave, {
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
      }, 25); // Speed of typing

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
    if (typingComplete) {
      setShowHintsButton(true);
    }
  }, [typingComplete]);

  const handleHintsRequest = async () => {
    setHintsRequested(true);
    setLoadingHints(true);

    setTimeout(async () => {
      const aiResponse = 'AI not connected';
      setHintsText(aiResponse);
      setLoadingHints(false);

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
        console.error(error);
      }
    }, 2000);
  };

  return (
    <Card style={[styles.card, styles.card__end]}>
      <Animated.View
        style={{
          opacity: containerHeight,
          height: containerHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [300, 450],
          }),
          overflow: 'hidden',
        }}>
        <Animated.View style={{opacity, transform: [{scale}]}}>
          <Card.Content style={styles.card__center}>
            <View style={styles.gap} />
            <Text style={styles.end__icon}>🎉</Text>
            <View style={styles.gap} />

            <Text variant="headlineMedium" style={styles.end__title}>
              {t('card.done')}
            </Text>

            <View style={styles.gap} />
            <View style={styles.gap} />

            <View>
              {displayedText.map((paragraph, index) => (
                <Text
                  key={index}
                  variant="bodyMedium"
                  style={[styles.summary__text, {marginBottom: 16}]}>
                  {paragraph}
                </Text>
              ))}

              {showHintsButton && !hintsRequested && (
                <Animated.View style={{marginTop: 8, opacity: buttonOpacity}}>
                  <Button
                    style={styles.button}
                    mode="contained"
                    onPress={handleHintsRequest}>
                    {t('summary.hints_button')}
                  </Button>
                </Animated.View>
              )}

              {hintsRequested && (
                <View>
                  {loadingHints ? (
                    <View style={[{marginTop: 8}]}>
                      <ActivityIndicator size="small" />
                    </View>
                  ) : (
                    <Text variant="bodyMedium" style={[styles.summary__text]}>
                      {hintsText}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </Card.Content>
        </Animated.View>
      </Animated.View>
    </Card>
  );
};

export default EndCard;
