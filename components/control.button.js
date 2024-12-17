import React from 'react';
import {Pressable} from 'react-native';
import {styles} from '../styles';
import {renderControlIcon} from '../utils';

const ControlButton = ({type, press, disabled}) => {
  function handlePress() {
    press && press();
  }

  const dynamicStyle = ({pressed}) => [
    styles.controlButton,
    {opacity: pressed ? 0.8 : 1},
    disabled && {opacity: 0.5},
  ];

  return (
    <Pressable style={dynamicStyle} onPress={handlePress} disabled={disabled}>
      {renderControlIcon(type)}
    </Pressable>
  );
};

export default ControlButton;
