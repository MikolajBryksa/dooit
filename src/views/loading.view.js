import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import AnimatedLogo from '../../assets/AnimatedLogo';

const LoadingView = ({setLoading}) => {
  const {t} = useTranslation();
  const styles = useStyles();

  useEffect(() => {
    const animationDuration = 800;
    const timer = setTimeout(() => {
      setLoading(false);
    }, animationDuration);

    return () => clearTimeout(timer);
  }, [setLoading]);

  return (
    <View style={styles.loading__container}>
      <AnimatedLogo />
    </View>
  );
};

export default LoadingView;
