import React from 'react';
import {View} from 'react-native';
import {Modal, Text, IconButton} from 'react-native-paper';
import {useStyles} from '@/styles';

const ModalComponent = ({
  visible,
  onDismiss,
  children,
  title,
  onClose,
  closeButtonDisabled = false,
}) => {
  const styles = useStyles();
  const handleClose = onClose || onDismiss;

  return (
    <Modal visible={visible} onDismiss={onDismiss}>
      <View style={styles.modal}>
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
      </View>
    </Modal>
  );
};

export default ModalComponent;
