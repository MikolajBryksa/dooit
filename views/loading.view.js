import React from 'react';
import {View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useStyles} from '../styles';

const LoadingView = () => {
  const {t} = useTranslation();
  const styles = useStyles();

  return (
    <View style={styles.loading__container}>
      <ActivityIndicator animating={true} size={'large'} />
      <Text style={styles.loading__text} variant="bodyMedium">
        {t('view.loading')}
      </Text>
    </View>
  );
};

export default LoadingView;
