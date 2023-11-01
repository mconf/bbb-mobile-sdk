import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../utils/locales/i18n';
import logger from '../services/logger';

const LocalesController = (props) => {
  const { defaultLanguage } = props;
  const { i18n } = useTranslation();

  useEffect(() => {
    const changeLanguage = (lng = 'en') => {
      i18n.changeLanguage(lng)
        .then(() => {
          logger.debug({
            logCode: 'app_locale_change',
          }, 'Change locale sucessfully');
        })
        .catch((err) => {
          logger.debug({
            logCode: 'app_locale_change',
            extraInfo: err,
          }, 'Change locale error');
        });
    };
    changeLanguage(defaultLanguage);
  }, []);

  return null;
};

export default LocalesController;
