import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import {
  Card,
  Button,
  Text,
  Modal,
  TextInput,
  IconButton,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {updateSettingValue} from '@/services/settings.service';
import {setSettings} from '@/redux/actions';

const NameModal = ({visible, onDismiss}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);
  const [tempUserName, setTempUserName] = useState('');

  useEffect(() => {
    if (visible) {
      setTempUserName(settings.userName || '');
    }
  }, [visible, settings.userName]);

  const handleSave = () => {
    const trimmedName = tempUserName.trim();
    if (trimmedName) {
      updateSettingValue('userName', trimmedName);
      const updatedSettings = {...settings, userName: trimmedName};
      dispatch(setSettings(updatedSettings));
    }
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.modal}>
      <Card.Content>
        <View style={styles.modal__title}>
          <Text variant="titleMedium">{t('settings.user-name')}</Text>
          <IconButton icon="close" size={20} onPress={onDismiss} />
        </View>

        <TextInput
          mode="outlined"
          label={t('settings.user-name')}
          value={tempUserName}
          onChangeText={setTempUserName}
          autoFocus
          style={{marginBottom: 16}}
          maxLength={30}
        />

        <Card.Actions>
          <Button
            mode="contained"
            onPress={handleSave}
            icon={!tempUserName.trim() ? 'lock' : 'check'}
            disabled={!tempUserName.trim()}>
            {t('button.save')}
          </Button>
        </Card.Actions>
      </Card.Content>
    </Modal>
  );
};

export default NameModal;
