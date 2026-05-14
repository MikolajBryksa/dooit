import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import {
  en as enPaperDates,
  pl as plPaperDates,
  de as dePaperDates,
  es as esPaperDates,
  fr as frPaperDates,
  nl as nlPaperDates,
  it as itPaperDates,
  ukUA as ukPaperDates,
  tr as trPaperDates,
  registerTranslation,
} from 'react-native-paper-dates';
import en from './translation/en.json';
import pl from './translation/pl.json';
import de from './translation/de.json';
import es from './translation/es.json';
import fr from './translation/fr.json';
import nl from './translation/nl.json';
import it from './translation/it.json';
import uk from './translation/uk.json';
import tr from './translation/tr.json';

const LANGUAGES = {
  en: {translation: en, paperDates: enPaperDates},
  pl: {translation: pl, paperDates: plPaperDates},
  de: {translation: de, paperDates: dePaperDates},
  es: {translation: es, paperDates: esPaperDates},
  fr: {translation: fr, paperDates: frPaperDates},
  nl: {translation: nl, paperDates: nlPaperDates},
  it: {translation: it, paperDates: itPaperDates},
  uk: {translation: uk, paperDates: ukPaperDates},
  tr: {translation: tr, paperDates: trPaperDates},
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGES);

export const detectDeviceLanguage = () => {
  const deviceLocales = RNLocalize.getLocales();
  const code = deviceLocales?.[0]?.languageCode;
  return SUPPORTED_LANGUAGES.includes(code) ? code : 'en';
};

Object.entries(LANGUAGES).forEach(([code, {paperDates}]) =>
  registerTranslation(code, paperDates),
);

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources: Object.fromEntries(
    Object.entries(LANGUAGES).map(([code, {translation}]) => [
      code,
      {translation},
    ]),
  ),
});

export default i18next;
