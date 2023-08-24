import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useOrientation } from '../../../hooks/use-orientation';
import { isPresenter } from '../../../store/redux/slices/current-user';
import PreviousPollCard from './poll-card';
import ScreenWrapper from '../../../components/screen-wrapper';
import Styled from './styles';

const PreviousPollScreen = () => {
  const { t } = useTranslation();
  const orientation = useOrientation();
  const navigation = useNavigation();
  const scrollViewRef = useRef();

  const previousPollPublishedStore = useSelector((state) => state.previousPollPublishedCollection);
  const amIPresenter = useSelector(isPresenter);

  const renderMethod = () => {
    if (
      Object.keys(previousPollPublishedStore.previousPollPublishedCollection)
        .length === 0
    ) {
      return (
        <>
          <Styled.Title>{t('mobileSdk.poll.noPollLabel')}</Styled.Title>
          <Styled.NoPollText>
            {t('mobileSdk.poll.noPollLabelYet')}
          </Styled.NoPollText>
        </>
      );
    }

    return (
      Object.values(
        previousPollPublishedStore.previousPollPublishedCollection
      ).map((pollObj) => <PreviousPollCard pollObj={pollObj} key={pollObj.id} />)
    );
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Styled.ContainerView orientation={orientation}>
          <Styled.ContainerPollCard
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            <Styled.ContainerViewPadding>
              <>
                {amIPresenter && (
                <Styled.ReturnButton onPress={() => navigation.goBack()}>
                  {t('mobileSdk.poll.createLabel')}
                </Styled.ReturnButton>
                )}
                {renderMethod()}
              </>
            </Styled.ContainerViewPadding>
          </Styled.ContainerPollCard>
        </Styled.ContainerView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default PreviousPollScreen;
