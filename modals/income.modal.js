import React from 'react';
import {Modal, View, Text, Linking} from 'react-native';
import ControlButton from '../components/control.button';
import {styles} from '../styles';
import {useTranslation} from 'react-i18next';

const IncomeModal = ({setShowModal}) => {
  const {t} = useTranslation();

  function handleClose() {
    setShowModal(false);
  }

  function handleAccept() {
    Linking.openURL('https://buymeacoffee.com/dooit');
    handleClose();
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.center}>{t('income')}</Text>
        </View>
        <View style={styles.controllers}>
          <ControlButton type="cancel" press={handleClose} />
          <ControlButton type="accept" press={handleAccept} />
        </View>
      </View>
    </Modal>
  );
};

export default IncomeModal;
