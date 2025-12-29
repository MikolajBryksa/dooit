import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import {useStyles} from '@/styles';
import {updateSettingValue} from '@/services/settings.service';
import {setSettings} from '@/redux/actions';

import MainCard from './main.card';
import StatusIconCircle from './status-icon.circle';
import {TYPE_DELAY} from '@/constants';

const StartCard = ({onStart}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);

  const startTitle = t('onboarding.start.title');
  const fullText = t('onboarding.start.text');

  const [displayedText, setDisplayedText] = useState('');
  const [currentChar, setCurrentChar] = useState(0);
  const [typewriterComplete, setTypewriterComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setCurrentChar(0);
    setTypewriterComplete(false);
  }, [fullText]);

  useEffect(() => {
    if (!fullText || typewriterComplete) return;

    if (currentChar < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.substring(0, currentChar + 1));
        setCurrentChar(c => c + 1);
      }, TYPE_DELAY);

      return () => clearTimeout(timer);
    }

    setTypewriterComplete(true);
  }, [fullText, currentChar, typewriterComplete]);

  const handleStart = useCallback(() => {
    updateSettingValue('firstLaunch', false);
    dispatch(setSettings({...settings, firstLaunch: false}));
    if (onStart) onStart();
  }, [dispatch, onStart, settings]);

  return (
    <MainCard
      style={styles.summary__card}
      outline
      iconContent={<StatusIconCircle start />}
      titleContent={<Text variant="titleLarge">{startTitle}</Text>}
      textContent={
        <View style={styles.summary_container}>
          <Text variant="bodyMedium" style={styles.summary__text}>
            {typewriterComplete ? fullText : displayedText}
          </Text>
        </View>
      }
      buttonsContent={
        <Button
          style={styles.button}
          mode="contained"
          icon={!typewriterComplete ? 'lock' : 'rocket-launch'}
          onPress={handleStart}
          disabled={!typewriterComplete}>
          {t('button.start')}
        </Button>
      }
    />
  );
};

export default StartCard;
