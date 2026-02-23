import React, {useMemo} from 'react';
import {Button, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {
  deleteExecution,
  getExecutionLabel,
} from '@/services/executions.service';
import DialogComponent from '@/components/dialog.component';

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
    <DialogComponent visible={visible} onDismiss={onDismiss}>
      <DialogComponent.Title>
        {t('title.delete-execution')}
      </DialogComponent.Title>
      <DialogComponent.Content>
        <Text variant="bodyMedium">{t('message.delete-execution')}</Text>
        {!!label && <Text variant="bodyMedium">{label}</Text>}
      </DialogComponent.Content>
      <DialogComponent.Actions>
        <Button onPress={onDismiss}>{t('button.cancel')}</Button>
        <Button onPress={handleDelete} disabled={!executionId || !habitId}>
          {t('button.delete')}
        </Button>
      </DialogComponent.Actions>
    </DialogComponent>
  );
};

export default DeleteExecutionDialog;
