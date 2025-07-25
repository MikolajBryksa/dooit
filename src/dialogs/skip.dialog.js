import React from 'react';
import {Dialog, Portal, Button, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

const SkipDialog = ({
  visible,
  onDismiss,
  onDone,
  handleSkipHabit,
  habitName,
}) => {
  const {t} = useTranslation();

  const skip = () => {
    handleSkipHabit();
    onDone();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t('title.skip')}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            {t('message.skip')} "{habitName}"?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('button.cancel')}</Button>
          <Button onPress={skip}>{t('button.skip')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default SkipDialog;
