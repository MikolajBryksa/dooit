import React from 'react';
import {View, ActivityIndicator} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '../styles';

const LoadingView = () => {
  const {t} = useTranslation();
  const styles = useStyles();

  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default LoadingView;
