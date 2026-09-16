import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
// eslint-disable-next-line camelcase
import pt_BR from './pt_BR.json';
import es from './es.json';

const resources = {
  en: { translation: en },
  // eslint-disable-next-line camelcase
  pt_BR: { translation: pt_BR },
  es: { translation: es },
};

const assertResourceBundles = () => {
  Object.entries(resources).forEach(([lng, namespaces]) => {
    Object.entries(namespaces).forEach(([ns, bundle]) => {
      i18n.addResourceBundle(lng, ns, bundle, true, true);
    });
  });
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  resources,
  react: {
    useSuspense: false,
  },
  interpolation: {
    escapeValue: false,
  },
  keySeparator: false,
});

// i18next is a process-wide singleton and init() rebuilds its resource store, and
// the embedded breakout SDK inits it again with its own older bundles.
i18n.on('initialized', assertResourceBundles);

export default i18n;
