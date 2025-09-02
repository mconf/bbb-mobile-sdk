import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrientation } from '../../hooks/use-orientation';
import ScreenWrapper from '../../components/screen-wrapper';
import logger from '../../services/logger';
import Styled from './styles';
import PrimaryButton from '../../components/buttons/primary-button';

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
      <PrimaryButton
        onPress={() => changeLanguage(item.id)}
        variant={item.id === i18n.language ? 'primary' : 'secondaryAlt'}
      >
        {item.title}
      </PrimaryButton>
    );
  };

  return (
    <ScreenWrapper>
      <Styled.ContainerView orientation={orientation}>
        <Styled.Block orientation={orientation}>
          <Styled.FlatList data={languages} renderItem={renderItem} />
        </Styled.Block>
      </Styled.ContainerView>
    </ScreenWrapper>
  );
};

export default SelectLanguageScreen;
