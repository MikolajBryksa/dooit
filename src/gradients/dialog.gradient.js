import React from 'react';
import {Dialog, Portal} from 'react-native-paper';
import {View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from 'react-native-paper';

const GradientDialog = ({visible, onDismiss, children}) => {
  const theme = useTheme();

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          shadowColor: 'transparent',
        }}>
        <View style={{overflow: 'hidden', borderRadius: 28}}>
          <LinearGradient
            colors={[theme.colors.surface, theme.colors.background]}
            locations={[0, 1]}
            start={{x: 0.5, y: 0}}
            end={{x: 0.5, y: 1}}
            style={{borderRadius: 28}}>
            {children}
          </LinearGradient>
        </View>
      </Dialog>
    </Portal>
  );
};

GradientDialog.Title = Dialog.Title;
GradientDialog.Content = Dialog.Content;
GradientDialog.Actions = Dialog.Actions;

export default GradientDialog;
