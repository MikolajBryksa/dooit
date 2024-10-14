import React from 'react';
import {Pressable} from 'react-native';

import {styles, COLORS} from '../styles';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faPlus,
  faCheck,
  faMinus,
  faPlay,
  faStop,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

const Control = ({type, press}) => {
  function handlePress() {
    press && press();
  }

  const iconColor = COLORS.background;

  let icon;
  switch (type) {
    case 'cancel':
      icon = <FontAwesomeIcon icon={faTimes} color={iconColor} />;
      break;
    case 'delete':
      icon = <FontAwesomeIcon icon={faMinus} color={iconColor} />;
      break;
    case 'accept':
      icon = <FontAwesomeIcon icon={faCheck} color={iconColor} />;
      break;
    case 'add':
      icon = <FontAwesomeIcon icon={faPlus} color={iconColor} />;
      break;
    case 'play':
      icon = <FontAwesomeIcon icon={faPlay} color={iconColor} />;
      break;
    case 'stop':
      icon = <FontAwesomeIcon icon={faStop} color={iconColor} />;
      break;
  }

  return (
    <Pressable
      style={({pressed}) => [styles.control, {opacity: pressed ? 0.8 : 1}]}
      onPress={handlePress}>
      {icon}
    </Pressable>
  );
};

export default Control;
