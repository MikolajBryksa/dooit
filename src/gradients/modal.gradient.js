import React from 'react';
import {Modal} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from 'react-native-paper';

const GradientModal = ({visible, onDismiss, children, style}) => {
  const theme = useTheme();

  return (
    <Modal visible={visible} onDismiss={onDismiss}>
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.background]}
        locations={[0, 1]}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={[
          {
            margin: 20,
            paddingTop: 20,
            paddingBottom: 20,
            paddingHorizontal: 10,
            borderRadius: 28,
          },
          style,
        ]}>
        {children}
      </LinearGradient>
    </Modal>
  );
};

export default GradientModal;
