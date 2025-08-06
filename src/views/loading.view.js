import React from 'react';
import {View} from 'react-native';
import {useStyles} from '@/styles';
import AnimatedLogo from '../../assets/AnimatedLogo';

const LoadingView = () => {
  const styles = useStyles();

  return (
    <View style={styles.container__center}>
      <AnimatedLogo />
    </View>
  );
};

export default LoadingView;
