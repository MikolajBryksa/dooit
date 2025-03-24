import React from 'react';
import {View} from 'react-native';
import {Appbar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useStyles} from '../styles';

const HomeView = () => {
  const {t} = useTranslation();
  const styles = useStyles();

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
