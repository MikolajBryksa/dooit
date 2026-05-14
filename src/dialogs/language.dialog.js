import React from 'react';
import {ScrollView, Dimensions} from 'react-native';
import {List} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import DialogComponent from '@/components/dialog.component';

export const LANGUAGE_NAMES = {
  en: 'English',
  pl: 'Polski',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  nl: 'Nederlands',
  it: 'Italiano',
  uk: 'Українська',
  tr: 'Türkçe',
  sv: 'Svenska',
  no: 'Norsk',
  ar: 'العربية',
  hi: 'हिन्दी',
  th: 'ไทย',
  ko: '한국어',
  ja: '日本語',
  zh: '简体中文',
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
        <ScrollView style={{maxHeight: Dimensions.get('window').height * 0.5}}>
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
        </ScrollView>
      </DialogComponent.Content>
    </DialogComponent>
  );
};

export default LanguageDialog;
