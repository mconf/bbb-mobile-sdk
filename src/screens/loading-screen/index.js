import { useTranslation } from 'react-i18next';
import Styled from './styles';

const LoadingScreen = () => {
  const { t } = useTranslation();

  return (
    <Styled.ContainerView>
      <Styled.Loading />
      <Styled.TitleText>
        {t('mobileSdk.join.genericLoading.label')}
      </Styled.TitleText>
    </Styled.ContainerView>
  );
};

export default LoadingScreen;
