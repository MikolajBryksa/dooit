import React, {useState} from 'react';
import {View} from 'react-native';
import {
  Card,
  Button,
  Text,
  Divider,
  Modal,
  Portal,
  IconButton,
} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import DaysSelector from '@/components/daysSelector';

const FilterHabitModal = ({visible, onDismiss, filterHabitsByDays}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const [repeatDays, setRepeatDays] = useState([]);

  const handleFilter = () => {
    filterHabitsByDays(repeatDays);
    onDismiss();
  };

  const handleReset = () => {
    filterHabitsByDays();
    setRepeatDays([]);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}>
        <Card.Content>
          <View style={styles.title}>
            <Text variant="titleLarge">{t('title.filter-habits')}</Text>
            <IconButton
              icon="close"
              size={20}
              onPress={() => {
                onDismiss();
              }}
            />
          </View>

          <Text variant="bodyMedium">{t('message.filter-habits')}?</Text>
          <Divider style={styles.divider} />
          <DaysSelector repeatDays={repeatDays} setRepeatDays={setRepeatDays} />
        </Card.Content>
        <Card.Actions>
          <Button mode="outlined" onPress={handleReset}>
            {t('button.reset')}
          </Button>
          <Button
            mode="contained"
            onPress={handleFilter}
            disabled={repeatDays.length === 0}>
            {t('button.filter')}
          </Button>
        </Card.Actions>
      </Modal>
    </Portal>
  );
};

export default FilterHabitModal;
