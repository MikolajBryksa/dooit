import React from 'react';
import {Card, Text, Button} from 'react-native-paper';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';

const NoHabitsCard = ({onAddHabit}) => {
  const {t} = useTranslation();
  const styles = useStyles();

  return (
    <Card style={[styles.card, styles.card__end]}>
      <Card.Content style={styles.card__center}>
        <View style={styles.gap} />
        <View style={styles.gap} />

        <Text style={styles.end__icon}>🌱</Text>

        <View style={styles.gap} />

        <Text variant="headlineMedium" style={styles.end__title}>
          {t('title.no-habits')}
        </Text>

        <View style={styles.gap} />
        <View style={styles.gap} />

        {onAddHabit && (
          <Button
            style={styles.button}
            mode="contained"
            onPress={onAddHabit}
            icon="plus">
            {t('title.add')}
          </Button>
        )}

        <View style={styles.gap} />
        <View style={styles.gap} />
        <View style={styles.gap} />
      </Card.Content>
    </Card>
  );
};

export default NoHabitsCard;
