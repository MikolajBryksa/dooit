import React, {useEffect, useRef} from 'react';
import {Card, Text} from 'react-native-paper';
import {View, Animated} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {pickRandomMotivation} from '@/utils';

const EndCard = () => {
  const {t} = useTranslation();
  const styles = useStyles();

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
  }, []);

  const celebrationMessage = pickRandomMotivation(t, 'end');

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

          <Text variant="bodyLarge" style={styles.motivation__message}>
            {celebrationMessage}
          </Text>

          <View style={styles.gap} />
          <View style={styles.gap} />

          <Text variant="bodyMedium" style={styles.end__tomorrow}>
            {t('message.see-you')}
          </Text>

          <View style={styles.gap} />
          <View style={styles.gap} />
          <View style={styles.gap} />
        </Card.Content>
      </Animated.View>
    </Card>
  );
};

export default EndCard;
