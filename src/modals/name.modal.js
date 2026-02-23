import React, {useState, useEffect} from 'react';
import {Card, Button, TextInput} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {updateSettingValue} from '@/services/settings.service';
import {setSettings} from '@/redux/actions';
import ModalComponent from '@/components/modal.component';

const NameModal = ({visible, onDismiss}) => {
  const {t} = useTranslation();
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
    <ModalComponent
      visible={visible}
      onDismiss={onDismiss}
      title={t('settings.user-name')}>
      <Card.Content>
        <TextInput
          mode="outlined"
          placeholder={t('settings.user-name')}
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
    </ModalComponent>
  );
};

export default NameModal;
