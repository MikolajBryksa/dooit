import React from 'react';
import {Dialog, Portal, Text} from 'react-native-paper';
import {View} from 'react-native';
import {useStyles} from '@/styles';

const DialogComponent = ({visible, onDismiss, children, title, titleStyle}) => {
  const styles = useStyles();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <View style={{overflow: 'hidden'}}>
          {title && (
            <View style={styles.dialog__title}>
              <Text variant="titleLarge" style={titleStyle}>{title}</Text>
            </View>
          )}
          {children}
        </View>
      </Dialog>
    </Portal>
  );
};

DialogComponent.Content = Dialog.Content;
DialogComponent.Actions = Dialog.Actions;

export default DialogComponent;
