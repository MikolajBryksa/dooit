import React from 'react';
import {Pressable} from 'react-native';
import {styles} from '../styles';
import {renderControlIcon} from '../utils';

const ControlButton = ({type, press, disabled, shape}) => {
  function handlePress() {
    press && press();
  }

  const dynamicStyle = ({pressed}) => {
    let shapeStyle;

    if (!shape) {
      shapeStyle = styles.controlButton;
    } else if (shape === 'circle') {
      shapeStyle = styles.circleButton;
    } else if (shape === 'shadow') {
      shapeStyle = styles.shadowButton;
    }

    return [
      shapeStyle,
      {opacity: pressed ? 0.8 : 1},
      disabled && {opacity: 0.5},
    ];
  };

  return (
    <Pressable style={dynamicStyle} onPress={handlePress} disabled={disabled}>
      {renderControlIcon(type, shape)}
    </Pressable>
  );
};

export default ControlButton;
