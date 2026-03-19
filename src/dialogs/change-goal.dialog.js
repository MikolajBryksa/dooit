import React from 'react';
import {Button, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import DialogComponent from '@/components/dialog.component';

const ChangeGoalDialog = ({
  visible,
  onDismiss,
  onConfirm,
  currentGoal,
  suggestedGoal,
}) => {
  const {t} = useTranslation();

  return (
    <DialogComponent
      visible={visible}
      onDismiss={onDismiss}
      title={t('title.change-goal')}>
      <DialogComponent.Content>
        <Text variant="bodyMedium" style={{marginBottom: 8}}>
          {t('message.change-goal')}
        </Text>

        <Text variant="bodyMedium">
          {t('card.goal')}: {currentGoal}
        </Text>

        <Text variant="bodyMedium">
          {t('card.newGoal')}: {suggestedGoal}
        </Text>
      </DialogComponent.Content>

      <DialogComponent.Actions>
        <Button onPress={onDismiss}>{t('button.cancel')}</Button>
        <Button onPress={onConfirm}>{t('button.save')}</Button>
      </DialogComponent.Actions>
    </DialogComponent>
  );
};

export default ChangeGoalDialog;
