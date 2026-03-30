import React from 'react';
import {ScrollView, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import DialogComponent from '@/components/dialog.component';
import {useStyles} from '@/styles';

const TermsDialog = ({visible, onDismiss}) => {
  const {t} = useTranslation();
  const styles = useStyles();

  return (
    <DialogComponent
      visible={visible}
      onDismiss={onDismiss}
      title={t('title.terms')}>
      <DialogComponent.Content>
        <ScrollView style={{maxHeight: 360}} showsVerticalScrollIndicator={false}>
          <View style={styles.terms__section}>
            <Text variant="bodyMedium" style={styles.terms__title}>
              {t('terms.s1-title')}
            </Text>
            <Text variant="bodySmall" style={styles.terms__body}>
              {t('terms.s1-intro')}
            </Text>
            <Text variant="bodySmall" style={styles.terms__body}>
              {t('terms.s1-body')}
            </Text>
          </View>

          <View style={styles.terms__section}>
            <Text variant="bodyMedium" style={styles.terms__title}>
              {t('terms.s2-title')}
            </Text>
            <Text variant="bodySmall" style={styles.terms__body}>
              {t('terms.s2-body')}
            </Text>
          </View>

          <View style={styles.terms__section}>
            <Text variant="bodyMedium" style={styles.terms__title}>
              {t('terms.s3-title')}
            </Text>
            <Text variant="bodySmall" style={styles.terms__body}>
              {t('terms.s3-body')}
            </Text>
          </View>
        </ScrollView>
      </DialogComponent.Content>
      <DialogComponent.Actions>
        <Button onPress={onDismiss}>{t('button.close')}</Button>
      </DialogComponent.Actions>
    </DialogComponent>
  );
};

export default TermsDialog;
