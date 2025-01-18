import React from 'react';
import {View, Text} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faMinus,
  faSave,
  faPlus,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import {styles} from '../styles';
import {renderViewIcon} from '../utils';

const toastConfig = {
  add: ({text1}) => (
    <View style={styles.toast}>
      <FontAwesomeIcon icon={faPlus} style={styles.centerIcon} />
      {renderViewIcon(text1)}
    </View>
  ),
  update: ({text1}) => (
    <View style={styles.toast}>
      <FontAwesomeIcon icon={faSave} style={styles.centerIcon} />
      {renderViewIcon(text1)}
    </View>
  ),
  delete: ({text1}) => (
    <View style={styles.toast}>
      <FontAwesomeIcon icon={faMinus} style={styles.centerIcon} />
      {renderViewIcon(text1)}
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
