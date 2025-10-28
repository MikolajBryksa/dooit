import React from 'react';
import {Card, Text, ActivityIndicator} from 'react-native-paper';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';

const LoadingHabitsCard = () => {
  const {t} = useTranslation();
  const styles = useStyles();

  return (
    <Card style={[styles.card, styles.card__end]}>
      <Card.Content style={styles.card__center}>
        <View style={styles.gap} />
        <View style={styles.gap} />
        <Text style={styles.end__icon}>⏳</Text>
        <View style={styles.gap} />
        <Text variant="headlineMedium" style={styles.end__title}>
          {t('title.loading-habits')}
        </Text>
        <View style={styles.gap} />
        <View style={styles.gap} />
        <ActivityIndicator size="small" color={styles.end__icon.color} />
        <View style={styles.gap} />
        <View style={styles.gap} />
        <View style={styles.gap} />
      </Card.Content>
    </Card>
  );
};

export default LoadingHabitsCard;
