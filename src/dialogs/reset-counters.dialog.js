import React from 'react';
import {Button, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import DialogComponent from '@/components/dialog.component';
import {useTheme} from 'react-native-paper';

const ResetDataDialog = ({visible, onDismiss, onConfirm}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <DialogComponent
      visible={visible}
      onDismiss={onDismiss}
      title={t('title.reset-counters')}
      titleStyle={{color: theme.colors.error}}>
      <DialogComponent.Content>
        <Text variant="bodyMedium">{t('message.reset-counters')}</Text>
      </DialogComponent.Content>
      <DialogComponent.Actions>
        <Button onPress={onDismiss}>{t('button.cancel')}</Button>
        <Button onPress={onConfirm}>{t('button.reset')}</Button>
      </DialogComponent.Actions>
    </DialogComponent>
  );
};

export default ResetDataDialog;
