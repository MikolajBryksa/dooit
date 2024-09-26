import React from 'react';
import {View, Text} from 'react-native';

import {styles} from '../styles';

const Tasks = () => {
  return (
    <View style={styles.container}>
      <View style={styles.note}>
        <Text style={styles.center}>Tasks</Text>
      </View>
    </View>
  );
};

export default Tasks;
