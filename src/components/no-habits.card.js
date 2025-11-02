import React from 'react';
import MainCard from './main.card';
import StatusIconCircle from './status-icon.circle';
import {Text, Button} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';

const NoHabitsCard = ({onAddHabit}) => {
  const {t} = useTranslation();
  const styles = useStyles();

  return (
    <MainCard
      outline={true}
      iconContent={<StatusIconCircle empty />}
      titleContent={<Text variant="titleLarge">{t('title.no-habits')}</Text>}
      buttonsContent={
        <Button
          style={styles.button}
          mode="contained"
          onPress={onAddHabit}
          icon="plus">
          {t('title.add')}
        </Button>
      }
    />
  );
};

export default NoHabitsCard;
