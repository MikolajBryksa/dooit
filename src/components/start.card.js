import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {useStyles} from '@/styles';
import {updateSettingValue} from '@/services/settings.service';
import {deleteUnavailableHabits} from '@/services/habits.service';
import {setSettings} from '@/redux/actions';
import MainCard from './main.card';
import InfoCircle from '../circles/info.circle';

const StartCard = ({onStart}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);

  const fullText = useMemo(
    () => t('onboarding.start.text', {userName: settings.userName}),
    [t, settings.userName],
  );

  const handleStart = useCallback(() => {
    deleteUnavailableHabits();
    updateSettingValue('firstLaunch', false);
    dispatch(setSettings({...settings, firstLaunch: false}));
    onStart?.();
  }, [dispatch, onStart, settings]);

  return (
    <MainCard
      style={styles.summary__card}
      outline
      iconContent={<InfoCircle start />}
      subtitleContent={
        <Text variant="titleMedium">
          {t('onboarding.start.subtitle', {userName: settings.userName})}
        </Text>
      }
      titleContent={
        <Text variant="titleLarge">{t('onboarding.start.title')}</Text>
      }
      textContent={
        <View style={styles.summary__container}>
          <Text variant="bodyMedium" style={styles.summary__text}>
            {fullText}
          </Text>
        </View>
      }
      buttonsContent={
        <Button
          style={styles.button}
          mode="contained"
          icon="rocket-launch"
          onPress={handleStart}>
          {t('button.start')}
        </Button>
      }
    />
  );
};

export default StartCard;
