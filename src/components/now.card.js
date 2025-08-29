import React, {useEffect, useState} from 'react';
import {Card, Text, IconButton, Avatar, ProgressBar} from 'react-native-paper';
import {View} from 'react-native';
import {updateHabit} from '@/services/habits.service';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {useSelector} from 'react-redux';
import PieChart from '@/components/pie.chart';
import {formatHourString} from '@/utils';

const NowCard = ({
  id,
  habitName,
  habitEnemy,
  score,
  level,
  repeatHours = [],
  selectedHour = null,
  icon,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const clockFormat = useSelector(state => state.settings.clockFormat);

  const active = true;

  return (
    <>
      <Card style={active ? styles.card : styles.card__deactivated}>
        <Card.Content style={styles.card__center}>
          <Avatar.Icon icon={icon} size={36} />
          <View style={styles.gap} />
          <Text variant="bodyMedium">
            {habitName} {t('card.instead')} {habitEnemy}{' '}
          </Text>
          <Text variant="bodyMedium">
            {score} {t('card.score')} / {level} {t('card.level')}
          </Text>

          <View style={styles.gap} />
          <Text variant="bodyLarge">{selectedHour}</Text>
          <Text variant="bodyMedium">
            {repeatHours.map(h => formatHourString(h, clockFormat)).join(', ')}
          </Text>
        </Card.Content>
        <View style={styles.gap} />

        {/* <Card.Content style={styles.card__buttons}>
          <>
            <IconButton icon="thumb-down" onPress={() => handleChoice('bad')} />
            <IconButton
              icon="close"
              onPress={() => setSkipDialogVisible(true)}
            />
            <IconButton icon="thumb-up" onPress={() => handleChoice('good')} />
          </>
        </Card.Content> */}
      </Card>
    </>
  );
};

export default NowCard;
