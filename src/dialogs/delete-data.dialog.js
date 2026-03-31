import React, {useState} from 'react';
import {Button, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import DialogComponent from '@/components/dialog.component';
import {useTheme} from 'react-native-paper';

const DeleteDataDialog = ({visible, onDismiss, onConfirm}) => {
  const {t} = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const theme = useTheme();

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch {
      setIsDeleting(false);
      onDismiss();
    }
  };

  return (
    <DialogComponent
      visible={visible}
      onDismiss={isDeleting ? () => {} : onDismiss}
      dismissable={!isDeleting}
      title={t('title.delete-data')}
      titleStyle={{color: theme.colors.error}}>
      <DialogComponent.Content>
        <Text variant="bodyMedium">{t('message.delete-data')}</Text>
      </DialogComponent.Content>
      <DialogComponent.Actions>
        <Button onPress={onDismiss} disabled={isDeleting}>
          {t('button.cancel')}
        </Button>
        <Button
          onPress={handleConfirm}
          disabled={isDeleting}
          loading={isDeleting}>
          {isDeleting ? t('button.deleting') : t('button.delete')}
        </Button>
      </DialogComponent.Actions>
    </DialogComponent>
  );
};

export default DeleteDataDialog;
