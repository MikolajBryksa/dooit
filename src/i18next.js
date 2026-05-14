import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import en from './translation/en.json';
import pl from './translation/pl.json';
import de from './translation/de.json';
import es from './translation/es.json';
import fr from './translation/fr.json';
import nl from './translation/nl.json';
import it from './translation/it.json';
import uk from './translation/uk.json';
import tr from './translation/tr.json';
import sv from './translation/sv.json';
import no from './translation/no.json';
import ar from './translation/ar.json';
import hi from './translation/hi.json';
import th from './translation/th.json';
import ko from './translation/ko.json';
import ja from './translation/ja.json';
import zh from './translation/zh.json';

const TRANSLATIONS = {
  en,
  pl,
  de,
  es,
  fr,
  nl,
  it,
  uk,
  tr,
  sv,
  no,
  ar,
  hi,
  th,
  ko,
  ja,
  zh,
};

export const SUPPORTED_LANGUAGES = Object.keys(TRANSLATIONS);

export const detectDeviceLanguage = () => {
  const deviceLocales = RNLocalize.getLocales();
  const code = deviceLocales?.[0]?.languageCode;
  return SUPPORTED_LANGUAGES.includes(code) ? code : 'en';
};

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources: Object.fromEntries(
    Object.entries(TRANSLATIONS).map(([code, translation]) => [
      code,
      {translation},
    ]),
  ),
});

export default i18next;
