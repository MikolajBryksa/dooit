import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './translation/en.json';
import pl from './translation/pl.json';

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {translation: en},
    pl: {translation: pl},
  },
});

export default i18next;
