import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-xhr-backend';
import Settings from '../../../settings.json';
// eslint-disable-next-line camelcase

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    debug: false,
    backend: {
      crossDomain: true,
      loadPath: Settings.locales.localesUrl,
    },
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
