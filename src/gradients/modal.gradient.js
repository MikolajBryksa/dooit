import React from 'react';
import {View} from 'react-native';
import {Modal, Text, IconButton} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from 'react-native-paper';
import {useStyles} from '@/styles';

const GradientModal = ({
  visible,
  onDismiss,
  children,
  style,
  title,
  onClose,
  closeButtonDisabled = false,
}) => {
  const theme = useTheme();
  const styles = useStyles();

  const handleClose = onClose || onDismiss;

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
        {title && (
          <View style={styles.modal__title}>
            <Text variant="titleLarge">{title}</Text>
            <IconButton
              icon="close"
              size={20}
              onPress={handleClose}
              disabled={closeButtonDisabled}
            />
          </View>
        )}
        {children}
      </LinearGradient>
    </Modal>
  );
};

export default GradientModal;
