import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {View} from 'react-native';
import {Text, Button, Card, Avatar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {updateSettingValue} from '@/services/settings.service';
import {setSettings} from '@/redux/actions';

const OnboardingView = ({setShowOnboarding}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);

  function handleGetStarted() {
    updateSettingValue('firstLaunch', false);
    const updatedSettings = {...settings, firstLaunch: false};
    dispatch(setSettings(updatedSettings));
    setShowOnboarding(false);
  }

  return (
    <View style={styles.loading__container}>
      <View style={styles.onboarding__title}>
        <Text variant="headlineMedium">{t('onboarding.welcome')}</Text>
        <Text variant="bodyLarge">{t('onboarding.to-app')}</Text>
      </View>
      <Card style={styles.onboarding__card}>
        <Card.Title
          title={t('onboarding.option.1.title')}
          subtitle={t('onboarding.option.1.subtitle')}
          left={props => <Avatar.Icon {...props} icon="infinity" />}
          subtitleNumberOfLines={2}
        />
      </Card>
      <Card style={styles.onboarding__card}>
        <Card.Title
          title={t('onboarding.option.2.title')}
          subtitle={t('onboarding.option.2.subtitle')}
          left={props => <Avatar.Icon {...props} icon="chart-bar" />}
          subtitleNumberOfLines={2}
        />
      </Card>
      <Card style={styles.onboarding__card}>
        <Card.Title
          title={t('onboarding.option.3.title')}
          subtitle={t('onboarding.option.3.subtitle')}
          left={props => <Avatar.Icon {...props} icon="heart" />}
          subtitleNumberOfLines={2}
        />
      </Card>

      <Button
        style={styles.onboarding__button}
        mode="contained"
        onPress={() => {
          handleGetStarted();
        }}>
        {t('onboarding.start')}
      </Button>
    </View>
  );
};

export default OnboardingView;
