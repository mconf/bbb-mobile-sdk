import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrientation } from '../../hooks/use-orientation';
import withPortal from '../../components/high-order/with-portal';
import logger from '../../services/logger';
import Styled from './styles';

const SelectLanguageScreen = () => {
  const orientation = useOrientation();
  const { i18n } = useTranslation();

  const languages = [
    {
      id: 'en',
      title: 'English',
    },
    {
      id: 'pt_BR',
      title: 'Português (Brasil)',
    },
    {
      id: 'es',
      title: 'Español',
    },
  ];

  const changeLanguage = (lng) => {
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

  const renderItem = ({ item }) => {
    return (
      <Styled.OptionsButton
        onPress={() => changeLanguage(item.id)}
        selected={item.id === i18n.language}
      >
        {item.title}
      </Styled.OptionsButton>
    );
  };

  return (
    <Styled.ContainerView orientation={orientation}>
      <Styled.Block orientation={orientation}>
        <Styled.FlatList data={languages} renderItem={renderItem} />
      </Styled.Block>
    </Styled.ContainerView>
  );
};

export default withPortal(SelectLanguageScreen);
