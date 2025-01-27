import React from 'react';
import {Pressable, Text} from 'react-native';
import {COLORS, styles} from '../styles';

const HeaderButton = ({name, press, active}) => {
  function handlePress() {
    press && press();
  }

  const dynamicStyle = ({pressed}) => {
    return [
      active ? styles.headerButtonActive : styles.headerButton,
      !active && {opacity: pressed ? 0.8 : 1},
    ];
  };

  return (
    <Pressable style={dynamicStyle} onPress={handlePress}>
      <Text style={{color: active ? COLORS.secondary : COLORS.primary}}>
        {name}
      </Text>
    </Pressable>
  );
};

export default HeaderButton;
