import React from 'react';
import {View, ActivityIndicator} from 'react-native';
import {COLORS, styles} from '../styles';

const LoadingView = () => {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={COLORS.secondary} />
    </View>
  );
};

export default LoadingView;
