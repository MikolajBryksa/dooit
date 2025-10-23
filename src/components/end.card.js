import React, {useEffect, useRef, useState} from 'react';
import {Card, Text, ActivityIndicator, Button} from 'react-native-paper';
import {View, Animated} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useSelector} from 'react-redux';

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

    const timer = setTimeout(() => {
      const dailySummary = generateDailySummary(habits);
      setSummaryData(dailySummary);
    }, 500);

    return () => clearTimeout(timer);
  }, [habits]);

  function generateDailySummary(habits) {
    // Generates a daily summary based on habits performance
    if (!habits || habits.length === 0) {
      return {paragraphs: [t('summary.no-habits')]};
    }

    const todayHabits = habits.filter(
      habit => habit.available && habit.repeatDays.includes(weekdayKey),
    );

    if (todayHabits.length === 0) {
      return {paragraphs: [t('summary.no-habits-today')]};
    }

    // Statistics
    let totalActions = 0;
    let goodActions = 0;
    let badActions = 0;
    let skipActions = 0;
    let bestHabit = null;
    let worstHabit = null;
    let maxSuccessRate = -1;
    let minSuccessRate = 101;

    todayHabits.forEach(habit => {
      const total = habit.goodCounter + habit.badCounter + habit.skipCounter;
      if (total === 0) return;

      const successRate = (habit.goodCounter / total) * 100;

      totalActions += total;
      goodActions += habit.goodCounter;
      badActions += habit.badCounter;
      skipActions += habit.skipCounter;

      if (successRate > maxSuccessRate && habit.goodCounter > 0) {
        maxSuccessRate = successRate;
        bestHabit = habit;
      }

      if (
        successRate < minSuccessRate &&
        (habit.badCounter > 0 || habit.skipCounter > 0)
      ) {
        minSuccessRate = successRate;
        worstHabit = habit;
      }
    });

    if (totalActions === 0) {
      return {paragraphs: [t('summary.no-actions-yet')]};
    }

    const goodRate = ((goodActions / totalActions) * 100).toFixed(0);
    const badRate = ((badActions / totalActions) * 100).toFixed(0);

    const paragraphs = [];

    // Paragraph 1: Overall stats
    const para1 = [];
    para1.push(t('summary.total_actions', {count: totalActions}));
    if (parseFloat(goodRate) >= parseFloat(badRate)) {
      para1.push(t('summary.good_rate_high', {rate: goodRate}));
    } else {
      para1.push(t('summary.bad_rate_high', {rate: badRate}));
    }
    paragraphs.push(para1.join(' '));

    // Paragraph 2: Best habit
    if (bestHabit && maxSuccessRate >= 50) {
      const para2 = [];
      para2.push(t('summary.best_habit', {habit: bestHabit.habitName}));
      para2.push(
        t('summary.best_habit_rate', {rate: Math.round(maxSuccessRate)}),
      );
      paragraphs.push(para2.join('\n'));
    }

    // Paragraph 3: Worst habit
    if (worstHabit && minSuccessRate < 80) {
      const para3 = [];
      para3.push(t('summary.worst_habit', {habit: worstHabit.habitName}));
      para3.push(
        t('summary.worst_habit_rate', {rate: Math.round(minSuccessRate)}),
      );
      paragraphs.push(para3.join('\n'));
    }

    return {paragraphs};
  }

  // Typewriter effect
  useEffect(() => {
    if (!summaryData.paragraphs || summaryData.paragraphs.length === 0) {
      return;
    }

    if (currentParagraph >= summaryData.paragraphs.length) {
      // All paragraphs displayed, show hints button
      setShowHintsButton(true);
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
    } else {
      // Last paragraph finished, show hints button
      setShowHintsButton(true);
    }
  }, [summaryData, currentParagraph, currentChar]);

  // Animate button appearance
  useEffect(() => {
    if (showHintsButton) {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [showHintsButton]);

  const handleHintsRequest = () => {
    setHintsRequested(true);
    setLoadingHints(true);

    // Simulate AI response
    setTimeout(() => {
      setHintsText('AI not connected');
      setLoadingHints(false);
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
