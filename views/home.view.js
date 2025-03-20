import React from 'react';
import {styles} from '../styles';
import {View} from 'react-native';
import {Appbar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

const HomeView = () => {
  const {t} = useTranslation();
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title={t('views.home')} />
      </Appbar.Header>

      <View style={styles.container}></View>
    </>
  );
};

export default HomeView;
