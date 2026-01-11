import React, {useState, useEffect} from 'react';
import {
  Modal,
  Text,
  Button,
  IconButton,
  Card,
  Portal,
} from 'react-native-paper';
import {View, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {getHabitExecutions} from '@/services/effectiveness.service';
import {getLocalDateKey, subtractDays} from '@/utils';
import realm from '@/storage/schemas';
import StatusSelector from '@/selectors/status.selector';
import {dayMap} from '@/constants';
import DeleteExecutionDialog from '@/dialogs/delete-execution.dialog';

const HistoryModal = ({visible, onDismiss, habitId, habitName}) => {
  const {t} = useTranslation();
  const styles = useStyles();

  const [executions, setExecutions] = useState([]);
  const [changes, setChanges] = useState({});

  const [deleteExecutionDialogVisible, setDeleteExecutionDialogVisible] =
    useState(false);
  const [executionToDelete, setExecutionToDelete] = useState(null);

  useEffect(() => {
    if (visible && habitId) {
      loadHistory();
      setChanges({});
      setDeleteExecutionDialogVisible(false);
      setExecutionToDelete(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, habitId]);

  const loadHistory = () => {
    const history = getHabitExecutions(habitId);

    history.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.hour.localeCompare(a.hour);
    });

    setExecutions(history);
    return history;
  };

  const handleStatusChange = (executionId, newStatus) => {
    setChanges(prev => ({
      ...prev,
      [executionId]: newStatus,
    }));
  };

  const handleSave = () => {
    realm.write(() => {
      Object.entries(changes).forEach(([executionId, newStatus]) => {
        const execution = realm.objectForPrimaryKey(
          'HabitExecution',
          executionId,
        );
        if (!execution) return;

        const oldStatus = execution.status;
        if (oldStatus === newStatus) return;

        execution.status = newStatus;

        const habit = realm.objectForPrimaryKey('Habit', habitId);
        if (!habit) return;

        if (oldStatus === 'good') {
          habit.goodCounter = Math.max(0, (habit.goodCounter || 0) - 1);
        } else if (oldStatus === 'bad') {
          habit.badCounter = Math.max(0, (habit.badCounter || 0) - 1);
        } else if (oldStatus === 'skip') {
          habit.skipCounter = Math.max(0, (habit.skipCounter || 0) - 1);
        }

        if (newStatus === 'good') {
          habit.goodCounter = (habit.goodCounter || 0) + 1;
        } else if (newStatus === 'bad') {
          habit.badCounter = (habit.badCounter || 0) + 1;
        } else if (newStatus === 'skip') {
          habit.skipCounter = (habit.skipCounter || 0) + 1;
        }
      });
    });

    onDismiss();
  };

  const formatDate = dateKey => {
    const today = getLocalDateKey();
    const yesterday = subtractDays(today, 1);

    if (dateKey === today) return t('button.today');
    if (dateKey === yesterday) return t('button.yesterday');

    const date = new Date(dateKey + 'T00:00:00');
    const todayDate = new Date(today + 'T00:00:00');
    const diffMs = todayDate.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffDays >= 2 && diffDays <= 7) {
      return t(`date.${dayMap[date.getDay()]}`);
    }

    return dateKey;
  };

  const getCurrentStatus = exec => {
    return changes[exec.id] !== undefined ? changes[exec.id] : exec.status;
  };

  const openDelete = exec => {
    setExecutionToDelete(exec);
    setDeleteExecutionDialogVisible(true);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}>
        <Card.Content>
          <View style={styles.modal__title}>
            <Text variant="titleMedium">{t('title.history')}</Text>
            <IconButton icon="close" size={20} onPress={onDismiss} />
          </View>

          <Text variant="bodyMedium" style={styles.modal__label}>
            {habitName}
          </Text>

          <ScrollView style={{maxHeight: 300}}>
            {executions.map(exec => (
              <View
                key={exec.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                }}>
                <View style={{flex: 1}}>
                  <Text variant="bodySmall">
                    {formatDate(exec.date)} {exec.hour}
                  </Text>
                </View>

                <IconButton
                  icon="trash-can"
                  size={18}
                  style={{margin: 0, marginLeft: 6}}
                  onPress={() => openDelete(exec)}
                />

                <View style={{width: 155}}>
                  <StatusSelector
                    value={getCurrentStatus(exec)}
                    onChange={newStatus =>
                      handleStatusChange(exec.id, newStatus)
                    }
                  />
                </View>
              </View>
            ))}
          </ScrollView>

          <Card.Actions>
            <Button
              mode="contained"
              onPress={handleSave}
              icon="check"
              disabled={Object.keys(changes).length === 0}>
              {t('button.save')}
            </Button>
          </Card.Actions>
        </Card.Content>
      </Modal>

      <DeleteExecutionDialog
        visible={deleteExecutionDialogVisible}
        onDismiss={() => setDeleteExecutionDialogVisible(false)}
        executionId={executionToDelete?.id}
        habitId={habitId}
        onDone={() => {
          setDeleteExecutionDialogVisible(false);

          setChanges(prev => {
            const next = {...prev};
            if (executionToDelete?.id) delete next[executionToDelete.id];
            return next;
          });

          setExecutionToDelete(null);
          const updatedHistory = loadHistory();

          if (updatedHistory.length === 0) {
            onDismiss();
          }
        }}
      />
    </Portal>
  );
};

export default HistoryModal;
