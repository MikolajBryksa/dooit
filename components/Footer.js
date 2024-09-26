import React from 'react';
import {View, Text} from 'react-native';

import {styles} from '../styles';

const Footer = () => {
  return (
    <View style={styles.footer}>
      <View style={styles.note}>
        <Text style={styles.center}>Footer</Text>
      </View>
    </View>
  );
};

export default Footer;
