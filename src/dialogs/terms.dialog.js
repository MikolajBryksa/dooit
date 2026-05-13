import React from 'react';
import {ScrollView, View, Linking} from 'react-native';
import {Button, Text, useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import DialogComponent from '@/components/dialog.component';
import {useStyles} from '@/styles';

const SECTIONS = ['s1', 's2', 's3', 's4'];
const URL_REGEX = /(https?:\/\/[^\s)]+)/g;

const TermsDialog = ({visible, onDismiss}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const theme = useTheme();

  const linkStyle = {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  };

  const renderWithLinks = text => {
    const parts = text.split(URL_REGEX);
    return parts.map((part, i) => {
      if (part.match(/^https?:\/\//)) {
        const cleaned = part.replace(/[.,;:!?]+$/, '');
        const trailing = part.slice(cleaned.length);
        return (
          <React.Fragment key={i}>
            <Text
              style={linkStyle}
              onPress={() => Linking.openURL(cleaned)}>
              {cleaned}
            </Text>
            {trailing}
          </React.Fragment>
        );
      }
      return part;
    });
  };

  return (
    <DialogComponent
      visible={visible}
      onDismiss={onDismiss}
      title={t('title.terms')}>
      <DialogComponent.Content>
        <ScrollView
          style={{maxHeight: 360}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.terms__section}>
            <Text variant="bodySmall" style={styles.terms__body}>
              {t('terms.last-updated')}
            </Text>
          </View>

          <View style={styles.terms__section}>
            <Text variant="bodySmall" style={styles.terms__body}>
              {renderWithLinks(t('terms.intro'))}
            </Text>
          </View>

          {SECTIONS.map(key => (
            <View key={key} style={styles.terms__section}>
              <Text variant="bodyMedium" style={styles.terms__title}>
                {t(`terms.${key}-title`)}
              </Text>
              <Text variant="bodySmall" style={styles.terms__body}>
                {renderWithLinks(t(`terms.${key}-body`))}
              </Text>
            </View>
          ))}
        </ScrollView>
      </DialogComponent.Content>
      <DialogComponent.Actions>
        <Button onPress={onDismiss}>{t('button.close')}</Button>
      </DialogComponent.Actions>
    </DialogComponent>
  );
};

export default TermsDialog;
