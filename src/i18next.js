import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

const LANGUAGE_LOADERS = {
  en: () => require('./translation/en.json'),
  pl: () => require('./translation/pl.json'),
  de: () => require('./translation/de.json'),
  es: () => require('./translation/es.json'),
  fr: () => require('./translation/fr.json'),
  nl: () => require('./translation/nl.json'),
  it: () => require('./translation/it.json'),
  uk: () => require('./translation/uk.json'),
  tr: () => require('./translation/tr.json'),
  sv: () => require('./translation/sv.json'),
  no: () => require('./translation/no.json'),
  ar: () => require('./translation/ar.json'),
  hi: () => require('./translation/hi.json'),
  th: () => require('./translation/th.json'),
  ko: () => require('./translation/ko.json'),
  ja: () => require('./translation/ja.json'),
  zh: () => require('./translation/zh.json'),
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_LOADERS);

export const detectDeviceLanguage = () => {
  const deviceLocales = RNLocalize.getLocales();
  const code = deviceLocales?.[0]?.languageCode;
  return SUPPORTED_LANGUAGES.includes(code) ? code : 'en';
};

const loadLanguageBundle = code => {
  if (!LANGUAGE_LOADERS[code]) return;
  if (i18next.hasResourceBundle(code, 'translation')) return;
  i18next.addResourceBundle(
    code,
    'translation',
    LANGUAGE_LOADERS[code](),
    true,
    true,
  );
};

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {translation: LANGUAGE_LOADERS.en()},
  },
});

export const changeLanguage = code => {
  loadLanguageBundle(code);
  return i18next.changeLanguage(code);
};

export default i18next;
