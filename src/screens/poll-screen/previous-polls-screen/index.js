import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import { useOrientation } from '../../../hooks/use-orientation';
import PreviousPollCard from './poll-card';
import withPortal from '../../../components/high-order/with-portal';
import Styled from './styles';

const PreviousPollScreen = () => {
  const { t } = useTranslation();
  const orientation = useOrientation();
  const scrollViewRef = useRef();

  const previousPollPublishedStore = useSelector((state) => state.previousPollPublishedCollection);

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
              {renderMethod()}
            </>
          </Styled.ContainerViewPadding>
        </Styled.ContainerPollCard>
      </Styled.ContainerView>
    </KeyboardAvoidingView>
  );
};

export default withPortal(PreviousPollScreen);
