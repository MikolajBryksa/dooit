import React from 'react';
import NowComponent from '../components/now.component';
import InfoCircle from '../circles/info.circle';
import {Text, Button} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

const EmptyCard = ({onAddHabit}) => {
  const {t} = useTranslation();

  return (
    <NowComponent
      iconContent={<InfoCircle empty />}
      subtitleContent={<Text variant="titleMedium">{t('empty.subtitle')}</Text>}
      titleContent={<Text variant="titleLarge">{t('empty.title')}</Text>}
      buttonsContent={
        <Button mode="contained" onPress={onAddHabit} icon="plus">
          {t('title.add')}
        </Button>
      }
    />
  );
};

export default EmptyCard;
