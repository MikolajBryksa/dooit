import React, {useMemo} from 'react';
import {Button, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {
  deleteExecution,
  getExecutionLabel,
} from '@/services/executions.service';
import GradientDialog from '@/gradients/dialog.gradient';

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
    <GradientDialog visible={visible} onDismiss={onDismiss}>
      <GradientDialog.Title>{t('title.delete-execution')}</GradientDialog.Title>
      <GradientDialog.Content>
        <Text variant="bodyMedium">{t('message.delete-execution')}</Text>
        {!!label && <Text variant="bodyMedium">{label}</Text>}
      </GradientDialog.Content>
      <GradientDialog.Actions>
        <Button onPress={onDismiss}>{t('button.cancel')}</Button>
        <Button onPress={handleDelete} disabled={!executionId || !habitId}>
          {t('button.delete')}
        </Button>
      </GradientDialog.Actions>
    </GradientDialog>
  );
};

export default DeleteExecutionDialog;
