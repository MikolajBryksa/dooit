import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import en from './translation/en.json';
import pl from './translation/pl.json';
import de from './translation/de.json';
import es from './translation/es.json';
import fr from './translation/fr.json';
import nl from './translation/nl.json';

export const SUPPORTED_LANGUAGES = ['en', 'pl', 'de', 'es', 'fr', 'nl'];

export const detectDeviceLanguage = () => {
  const deviceLocales = RNLocalize.getLocales();
  const code = deviceLocales?.[0]?.languageCode;
  return SUPPORTED_LANGUAGES.includes(code) ? code : 'en';
};

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {translation: en},
    pl: {translation: pl},
    de: {translation: de},
    es: {translation: es},
    fr: {translation: fr},
    nl: {translation: nl},
  },
});

export default i18next;
