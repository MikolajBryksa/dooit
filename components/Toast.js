import React from 'react';
import {View, Text} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faMinus,
  faRefresh,
  faPlus,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import {styles} from '../styles';

const toastConfig = {
  delete: ({text1}) => (
    <View style={styles.toast}>
      <FontAwesomeIcon icon={faMinus} style={styles.centerIcon} />
      <Text style={styles.center}>{text1}</Text>
    </View>
  ),
  update: ({text1, text2}) => (
    <View style={styles.toast}>
      <FontAwesomeIcon icon={faRefresh} style={styles.centerIcon} />
      <Text style={[styles.center, {textDecorationLine: 'line-through'}]}>
        {text1}
      </Text>
      <Text style={styles.center}>{text2}</Text>
    </View>
  ),
  add: ({text1}) => (
    <View style={styles.toast}>
      <FontAwesomeIcon icon={faPlus} style={styles.centerIcon} />
      <Text style={styles.center}>{text1}</Text>
    </View>
  ),
  error: ({text1}) => (
    <View style={styles.toast}>
      <FontAwesomeIcon icon={faWarning} style={styles.centerIcon} />
      <Text style={styles.center}>{text1}</Text>
    </View>
  ),
};

export default toastConfig;
