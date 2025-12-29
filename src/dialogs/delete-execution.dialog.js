import React, {useMemo} from 'react';
import {Dialog, Portal, Button, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {
  deleteExecution,
  getExecutionLabel,
} from '@/services/effectiveness.service';

const DeleteExecutionDialog = ({
  visible,
  onDismiss,
  onDone,
  executionId,
  habitId,
}) => {
  const {t} = useTranslation();

  const label = useMemo(() => {
    if (!visible || !executionId) return '';
    return getExecutionLabel(executionId) || '';
  }, [visible, executionId]);

  const handleDelete = () => {
    if (!executionId || !habitId) return;
    deleteExecution(executionId, habitId);
    onDone?.();
    onDismiss?.();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t('title.delete-execution')}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{t('message.delete-execution')}</Text>
          {!!label && <Text variant="bodyMedium">{label}</Text>}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('button.cancel')}</Button>
          <Button onPress={handleDelete} disabled={!executionId || !habitId}>
            {t('button.delete')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default DeleteExecutionDialog;
