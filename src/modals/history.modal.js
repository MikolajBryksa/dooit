import React, {useState, useEffect} from 'react';
import {
  Text,
  Button,
  IconButton,
  Card,
  Portal,
  Checkbox,
} from 'react-native-paper';
import {View, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {getExecutions, updateExecution} from '@/services/executions.service';
import {getLocalDateKey, subtractDays} from '@/utils';
import {dayMap} from '@/constants';
import DeleteExecutionDialog from '@/dialogs/delete-execution.dialog';
import ModalComponent from '@/components/modal.component';

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
    const history = getExecutions(habitId);

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
    Object.entries(changes).forEach(([executionId, newStatus]) => {
      updateExecution(executionId, newStatus);
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
      <ModalComponent
        visible={visible}
        onDismiss={onDismiss}
        title={t('title.history')}>
        <Card.Content>
          <Text variant="bodyMedium" style={styles.modal__label}>
            {habitName}
          </Text>

          <ScrollView style={{maxHeight: 300}}>
            {executions.map(exec => {
              const status = getCurrentStatus(exec);
              const checked = status === 'good';

              return (
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

                  {/* Zamiast SegmentedButtons: pojedynczy checkbox */}
                  <Checkbox
                    status={checked ? 'checked' : 'unchecked'}
                    onPress={() =>
                      handleStatusChange(exec.id, checked ? 'bad' : 'good')
                    }
                  />
                </View>
              );
            })}
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
      </ModalComponent>

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
