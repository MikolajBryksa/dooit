import React from 'react';
import {View, Text} from 'react-native';

import {styles} from '../styles';

const Habits = () => {
  return (
    <View style={styles.container}>
      <View style={styles.note}>
        <Text style={styles.center}>Habits</Text>
      </View>
    </View>
  );
};

export default Habits;
