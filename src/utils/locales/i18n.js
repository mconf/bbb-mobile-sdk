import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
// eslint-disable-next-line camelcase
import pt_BR from './pt_BR.json';
import es from './es.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  resources: {
    en: { translation: en },
    // eslint-disable-next-line camelcase
    pt_BR: { translation: pt_BR },
    es: { translation: es },
  },
  react: {
    useSuspense: false,
  },
  interpolation: {
    escapeValue: false,
  }
});

export default i18n;
