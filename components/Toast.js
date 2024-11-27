import React from 'react';
import {View} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faMinus, faSave, faPlus} from '@fortawesome/free-solid-svg-icons';
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
};

export default toastConfig;
