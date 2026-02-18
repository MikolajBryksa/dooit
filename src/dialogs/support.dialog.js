import React from 'react';
import {Button, Text} from 'react-native-paper';
import {Linking} from 'react-native';
import {useTranslation} from 'react-i18next';
import GradientDialog from '@/gradients/dialog.gradient';

const SupportDialog = ({visible, onDismiss, onDone}) => {
  const {t} = useTranslation();

  const handleSupport = () => {
    Linking.openURL('https://buymeacoffee.com/dooit');
    onDone();
  };

  return (
    <GradientDialog visible={visible} onDismiss={onDismiss}>
      <GradientDialog.Title>{t('title.support')}</GradientDialog.Title>
      <GradientDialog.Content>
        <Text variant="bodyMedium">{t('message.support')}</Text>
      </GradientDialog.Content>
      <GradientDialog.Actions>
        <Button onPress={onDismiss}>{t('button.cancel')}</Button>
        <Button onPress={handleSupport}>{t('button.buy')}</Button>
      </GradientDialog.Actions>
    </GradientDialog>
  );
};

export default SupportDialog;
