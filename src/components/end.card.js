import React, {useEffect, useRef, useState} from 'react';
import {Card, Text, ActivityIndicator} from 'react-native-paper';
import {View, Animated} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {generateDailySummary} from '@/utils';
import {useSelector} from 'react-redux';

const EndCard = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const habits = useSelector(state => state.habits);

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
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
    ]).start();

    // Automatically generate a summary after 1 second (AI simulation)
    const timer = setTimeout(() => {
      const dailySummary = generateDailySummary(habits, t);
      setSummary(dailySummary);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [habits, t]);

  return (
    <Card style={[styles.card, styles.card__end]}>
      <Animated.View style={{opacity, transform: [{scale}]}}>
        <Card.Content style={styles.card__center}>
          <View style={styles.gap} />
          <View style={styles.gap} />

          <Text style={styles.end__icon}>🎉</Text>

          <View style={styles.gap} />

          <Text variant="headlineMedium" style={styles.end__title}>
            {t('card.done')}
          </Text>

          <View style={styles.gap} />

          {loading ? (
            <View style={styles.card__center}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <View style={styles.card__center}>
              <Text variant="bodyMedium" style={styles.summary__text}>
                {summary}
              </Text>
            </View>
          )}
          <View style={styles.gap} />
          <View style={styles.gap} />
          <View style={styles.gap} />
        </Card.Content>
      </Animated.View>
    </Card>
  );
};

export default EndCard;
