import React from 'react';
import NowComponent from '../components/now.component';
import InfoCircle from '../circles/info.circle';
import {Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

const LoadingCard = () => {
  const {t} = useTranslation();

  return (
    <NowComponent
      iconContent={<InfoCircle loading />}
      subtitleContent={
        <Text variant="titleMedium">{t('loading.subtitle')}</Text>
      }
      titleContent={<Text variant="titleLarge">{t('loading.title')}</Text>}
    />
  );
};

export default LoadingCard;
