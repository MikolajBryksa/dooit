import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {styles} from '../styles';
import {useTranslation} from 'react-i18next';

const HomeView = () => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      <>
        <View style={styles.header}>
          <Text style={styles.center}></Text>
        </View>

        <ScrollView style={styles.scrollView}></ScrollView>
      </>
    </View>
  );
};

export default HomeView;
