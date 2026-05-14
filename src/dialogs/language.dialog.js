import React from 'react';
import {List} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import DialogComponent from '@/components/dialog.component';

export const LANGUAGE_NAMES = {
  en: 'English',
  pl: 'Polski',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
};

const LanguageDialog = ({visible, onDismiss, language, onSelectLanguage}) => {
  const {t} = useTranslation();

  const handleSelect = lang => {
    if (lang !== language) onSelectLanguage(lang);
    onDismiss();
  };

  return (
    <DialogComponent
      visible={visible}
      onDismiss={onDismiss}
      title={t('settings.language')}>
      <DialogComponent.Content>
        {Object.entries(LANGUAGE_NAMES).map(([lang, name]) => (
          <List.Item
            key={lang}
            title={name}
            onPress={() => handleSelect(lang)}
            right={props =>
              language === lang ? <List.Icon {...props} icon="check" /> : null
            }
          />
        ))}
      </DialogComponent.Content>
    </DialogComponent>
  );
};

export default LanguageDialog;
