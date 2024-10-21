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

const toastConfig = {
  add: ({text1, text2}) => (
    <View style={styles.toast}>
      <FontAwesomeIcon icon={faPlus} style={styles.centerIcon} />
      {text1 !== '' && <Text style={styles.center}>{text1}:</Text>}
      <Text style={styles.center}>{text2}</Text>
    </View>
  ),
  update: ({text1, text2}) => (
    <View style={styles.toast}>
      <FontAwesomeIcon icon={faSave} style={styles.centerIcon} />
      {text1 !== '' && <Text style={styles.center}>{text1}:</Text>}
      <Text style={styles.center}>{text2}</Text>
    </View>
  ),
  delete: ({text1, text2}) => (
    <View style={styles.toast}>
      <FontAwesomeIcon icon={faMinus} style={styles.centerIcon} />
      {text1 !== '' && <Text style={styles.center}>{text1}:</Text>}
      <Text style={styles.center}>{text2}</Text>
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
