import React from 'react';
import {Button, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import DialogComponent from '@/components/dialog.component';

const GoalReachedDialog = ({
  visible,
  onDismiss,
  currentGoal,
  suggestedGoal,
  onIncreaseGoal,
}) => {
  const {t} = useTranslation();

  return (
    <DialogComponent
      visible={visible}
      onDismiss={onDismiss}
      title={t('title.goal-reached')}>
      <DialogComponent.Content>
        <Text variant="bodyMedium" style={{marginBottom: 8}}>
          {t('message.goal-reached')}
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
        <Button onPress={onIncreaseGoal}>{t('button.save')}</Button>
      </DialogComponent.Actions>
    </DialogComponent>
  );
};

export default GoalReachedDialog;
