import React from 'react';
import {View, Text} from 'react-native';

import {styles} from '../styles';

const Costs = () => {
  return (
    <View style={styles.container}>
      <View style={styles.note}>
        <Text style={styles.center}>Costs</Text>
      </View>
    </View>
  );
};

export default Costs;
