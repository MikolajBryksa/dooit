import React from 'react';
import MainCard from './main.card';
import StatusIconCircle from './status-icon.circle';
import {Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

const LoadingHabitsCard = () => {
  const {t} = useTranslation();

  return (
    <MainCard
      outline={true}
      iconContent={<StatusIconCircle loading />}
      titleContent={
        <Text variant="titleLarge">{t('title.loading-habits')}</Text>
      }
    />
  );
};

export default LoadingHabitsCard;
