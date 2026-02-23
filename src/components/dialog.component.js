import React from 'react';
import {Dialog, Portal} from 'react-native-paper';
import {View} from 'react-native';
import {useStyles} from '@/styles';

const DialogComponent = ({visible, onDismiss, children}) => {
  const styles = useStyles();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <View style={{overflow: 'hidden'}}>{children}</View>
      </Dialog>
    </Portal>
  );
};

DialogComponent.Title = Dialog.Title;
DialogComponent.Content = Dialog.Content;
DialogComponent.Actions = Dialog.Actions;

export default DialogComponent;
