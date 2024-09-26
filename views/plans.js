import React from 'react';
import {View, Text} from 'react-native';

import {styles} from '../styles';

const Plans = () => {
  return (
    <View style={styles.container}>
      <View style={styles.note}>
        <Text style={styles.center}>Plans</Text>
      </View>
    </View>
  );
};

export default Plans;
