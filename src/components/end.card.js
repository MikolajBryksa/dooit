import React, {useEffect, useState} from 'react';
import {Card, Text, Chip, ProgressBar} from 'react-native-paper';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {getFormattedTime} from '@/utils';

const EndCard = ({setCurrentItemAll, fetchHabits}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const [currentTime, setCurrentTime] = useState(getFormattedTime(false, true));
  const [timeToMidnight, setTimeToMidnight] = useState('');
  const [progressValue, setProgressValue] = useState(0);

  const calculateTimeToMidnight = currentTime => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const diffMs = midnight.getTime() - now.getTime();
    const totalSeconds = Math.floor(diffMs / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      timeString: `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      progress: 1 - totalSeconds / (24 * 60 * 60),
    };
  };

  useEffect(() => {
    const updateTime = () => {
      const formattedTime = getFormattedTime(false, true);
      setCurrentTime(formattedTime);

      const {timeString, progress} = calculateTimeToMidnight(formattedTime);
      setTimeToMidnight(timeString);
      setProgressValue(progress);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Card style={styles.card}>
        <Card.Content style={styles.card__center}>
          <Text variant="titleMedium">{t('card.done')}</Text>
        </Card.Content>

        <Card.Content style={styles.card__center}>
          <View style={styles.card__center}>
            <Text variant="bodyMedium">
              {t('card.remaining-new-day')}: {timeToMidnight}
            </Text>
          </View>

          <View style={{width: '100%'}}>
            <ProgressBar
              progress={progressValue}
              style={{height: 6, borderRadius: 4}}
            />
          </View>
        </Card.Content>

        {/* <View style={styles.gap} />
        <Card.Content style={styles.card__buttons}>
          <Chip
            icon="refresh"
            mode="outlined"
            onPress={() => {
              setCurrentItemAll(0);
              fetchHabits();
            }}
            style={styles.chip}>
            {t('card.start')}
          </Chip>
        </Card.Content> */}
      </Card>
    </>
  );
};

export default EndCard;
