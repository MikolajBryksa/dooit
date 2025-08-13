import React from 'react';
import {View, ScrollView} from 'react-native';
import {Dialog, Portal, Button, Text, useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {dayFullMap} from '@/constants';

const PlanDialog = ({
  visible,
  onDismiss,
  filteredHabits,
  currentHabitIndex,
  currentDay,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const theme = useTheme();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t(`date.${dayFullMap[currentDay]}`)}</Dialog.Title>
        <Dialog.Content>
          <ScrollView style={styles.plan}>
            {filteredHabits.length > 0 && (
              <>
                {filteredHabits.map((habit, index) => (
                  <View key={habit.id} style={styles.habitListItem}>
                    <Text
                      variant="bodyMedium"
                      style={[
                        styles.habitListText,
                        index === currentHabitIndex && {
                          color: theme.colors.primary,
                        },
                      ]}>
                      {habit.currentHour} {habit.habitName}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('button.close')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default PlanDialog;
